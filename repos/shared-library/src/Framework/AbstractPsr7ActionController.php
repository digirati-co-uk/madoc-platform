<?php

namespace Digirati\OmekaShared\Framework;

use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Api\Representation\UserRepresentation;
use Zend\Diactoros\Response;
use Zend\Http\Request;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Mvc\MvcEvent;
use Zend\Psr7Bridge\Psr7Response;
use Zend\View\Model\ViewModel;

/**
 * @method SiteRepresentation currentSite()
 * @method setBrowseDefaults(string $created)
 * @method UserRepresentation identity()
 */
class AbstractPsr7ActionController extends AbstractActionController
{
    private $corsEnabled = false;

    protected function allowCors()
    {
        $this->corsEnabled = true;
    }

    public function preflightAction() {
        $request = $this->getRequest();
        $response = new \Zend\Http\Response();
        $headers = $response->getHeaders();
        $origin = $request->getHeader('Origin');
        $originValue = $origin ? $origin->getFieldValue() : '*';
        $headers->addHeaders([
            'Access-Control-Allow-Headers' => 'Content-Type,Authorization',
            'Access-Control-Allow-Methods' => 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Credentials' => 'true',
            'Access-Control-Allow-Origin' => $originValue,
        ]);
        $response->setStatusCode(200);
        $response->setHeaders($headers);
        return $response;
    }

    public function onDispatch(MvcEvent $e)
    {
        $result = parent::onDispatch($e);
        if ($result instanceof Response) {
            $result = Psr7Response::toZend($result);
        }

        if ($this->corsEnabled) {
            $headers = $result->getHeaders();
            /** @var Request $req */
            $req = $e->getRequest();
            $reqHeaders = $req->getHeaders()->toArray() ?? [];
            $origin = $reqHeaders['Origin'] ?? '*';
            $headers->addHeaderLine('Access-Control-Allow-Origin: ' . $origin);
            $headers->addHeaderLine('Access-Control-Allow-Methods: PUT, GET, POST, PATCH, DELETE, OPTIONS');
            $headers->addHeaderLine('Access-Control-Allow-Headers: Authorization, Origin, X-Requested-With, Content-Type, Accept');
        }

        return $result;
    }

    public function paginateControls(ViewModel $viewModel, $totalResults, $perPage) {
        if ($totalResults > $perPage) {
            $page = $this->params()->fromQuery('page') ?? 1;
            $maxPage = ceil($totalResults / $perPage);
            if ($page > $maxPage) {
                $page = $maxPage;
            }
            if (($page + 1) <= $maxPage) {
                $viewModel->setVariable('nextPage', $this->url()->fromRoute(null, [], [
                    'query' => [
                        'page' => $page + 1,
                    ]
                ], true));
            }
            if ($page > 1) {
                $viewModel->setVariable('prevPage', $this->url()->fromRoute(null, [], [
                    'query' => [
                        'page' => $page - 1,
                    ]
                ], true));
            }
            $viewModel->setVariable('totalPages', $maxPage);
            $viewModel->setVariable('page', $page);
        }
    }

    public function paginate(ViewModel $viewModel, $name, $list, $perPage) {
        if (sizeof($list) > $perPage) {
            $page = $this->params()->fromQuery('page') ?? 1;
            $maxPage = ceil(sizeof($list) / $perPage);
            if ($page > $maxPage) {
                $page = $maxPage;
            }
            $viewModel->setVariable($name, array_slice($list, ($page-1) * $perPage, $perPage));

            $this->paginateControls($viewModel, sizeof($list), $perPage);

        } else {
            $viewModel->setVariable($name, $list);
        }
    }
}
