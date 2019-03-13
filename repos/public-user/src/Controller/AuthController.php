<?php

namespace PublicUser\Controller;

use Omeka\Api\Exception\BadRequestException;
use Omeka\Mvc\Exception\NotFoundException;
use PublicUser\Auth\TokenService;
use PublicUser\Form\AuthTokenForm;
use Zend\Authentication\AuthenticationService;
use Zend\Http\Response;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Session\Container;
use Zend\View\Model\ViewModel;

class AuthController extends AbstractActionController
{

    /**
     * @var AuthenticationService
     */
    private $auth;
    /**
     * @var TokenService
     */
    private $token;

    public function __construct(
        AuthenticationService $auth,
        TokenService $token
    ) {
        $this->auth = $auth;
        $this->token = $token;
    }

    public function getPostJson()
    {
        return json_decode(
            $this->getRequest()->getContent(),
            true
        );
    }

    public function authAction()
    {
        $params = $this->params();
        // The params we need.
        $response_type = $params->fromQuery('response_type');
        $client_id = $params->fromQuery('client_id');
        $redirect_uri = $params->fromQuery('redirect_uri');
        $scope = explode(',', $params->fromQuery('scope'));
        $state = $params->fromQuery('state');

        if ($response_type !== 'code' || !$client_id || !$scope || !$state || !$redirect_uri) {
            throw new BadRequestException();
        }

        // Store all this first and foremost in the session, nuking any previous attempts.
        if (!$this->getRequest()->isPost()) {
            $session = new Container('auth_request');
            $session->params = $params;
        }

        if (!$this->auth->getIdentity()) {
            return $this->redirect()->toRoute('site/publicuser-login', [], [
                'query' => [
                    'redirect' => $this->url()->fromRoute(null, [], [
                        'query' => $this->params()->fromQuery(),
                    ], true)
                ]
            ], true);
        }

        $authClient = $this->token->validateRequest($client_id, $redirect_uri, $scope);
        if (!$authClient) {
            throw new BadRequestException();
        }

        $form = new AuthTokenForm();
        $form->init();

        if ($this->getRequest()->isPost()) {
            // Validate posted data
            $form->setData($this->params()->fromPost());
            // @todo check form values against session.
            if ($form->isValid()) {
                try {
                    // Generate auth token
                    $token = $this->token->generateAuthorizationCode(
                        $client_id,
                        $this->auth->getIdentity()->getId(),
                        $scope
                    );
                    // Go to redirect.
                    return $this->redirect()->toUrl($token->generateRedirect($state));
                } catch (\Throwable $e) {
                    error_log((string) $e);
                    return $this->redirect()->toUrl($redirect_uri);
                }
            } else {
                return $this->redirect()->toUrl($redirect_uri);
            }
        }

        return new ViewModel([
            'form' => $form,
            'client' => $authClient
        ]);
    }

    public function tokenAction()
    {
        $httpResponse = $this->getResponse();
        $httpResponse->getHeaders()->addHeaderLine('Content-Type', 'application/json');

        if (!$this->getRequest()->isPost()) {
            throw new NotFoundException();
        }
        $json = $this->getPostJson();

        if (!isset($json['grant_type']) || $json['grant_type'] !== 'authorization_code') {
            $httpResponse->setContent(json_encode([
                'error' => 'Invalid grant type'
            ]));
            return $httpResponse;
        }

        $authToken = $this->token->getAuthToken($json['code']);

        if (!$authToken) {
            $httpResponse->setContent(json_encode([
                'error' => 'invalid or expired token',
            ]));
            return $httpResponse;
        }

        if ($authToken->getClientId() !== $json['client_id']) {
            $httpResponse->setContent(json_encode([
                'error' => 'Invalid client id'
            ]));
            return $httpResponse;
        }

        $accessToken = $this->token->exchangeAuthorizationCode($authToken);


        $httpResponse->setContent(json_encode([
            'access_token' => $accessToken->getAccessToken(),
            'expires_in' => $accessToken->getExpires()->format('U') - time()
        ]));

        return $httpResponse;
    }

}
