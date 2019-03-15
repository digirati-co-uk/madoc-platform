<?php

namespace PublicUser;

use Doctrine\DBAL\Schema\Comparator;
use Doctrine\ORM\Tools\SchemaTool;
use IIIFImport\Extension\Entity\IiifCanvasEntity;
use IIIFImport\Extension\Entity\IiifCollectionEntity;
use IIIFImport\Extension\Entity\IiifManifestEntity;
use Omeka\Api\Adapter\UserAdapter;
use Omeka\Api\Manager;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Api\Representation\UserRepresentation;
use Omeka\Api\Response;
use Omeka\Entity\User;
use Omeka\Module\AbstractModule;
use Omeka\Permissions\Assertion\SiteIsPublicAssertion;
use PublicUser\Acl\IsOnRouteAssertion;
use PublicUser\Acl\IsRegistrationPermittedAssertion;
use PublicUser\Auth\TokenService;
use PublicUser\Controller\AccountController;
use PublicUser\Controller\AuthController;
use PublicUser\Controller\LoginController;
use PublicUser\Controller\SiteLoginRedirectController;
use PublicUser\Settings\PublicUserSettings;
use PublicUser\Site\SiteProvider;
use PublicUser\Subscriber\AnnotationCreatorElucidateSubscriber;
use PublicUser\Subscriber\AnnotationStatsSubscriber;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Throwable;
use Zend\Authentication\AuthenticationService;
use Zend\Config\Factory;
use Zend\EventManager\EventManager;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Mvc\Controller\AbstractController;
use Zend\Mvc\MvcEvent;
use Zend\Permissions\Acl\Acl;
use Zend\Permissions\Acl\Assertion\AssertionAggregate;
use Zend\Permissions\Acl\Role\GenericRole as Role;
use Zend\Router\RouteInterface;
use Zend\ServiceManager\ServiceLocatorInterface;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;

class Module extends AbstractModule
{
    private $config;

    public function getConfig()
    {
        if ($this->config) {
            return $this->config;
        }
        // Load our composer dependencies.
        $this->loadVendor();
        $this->config = Factory::fromFiles(
            glob(__DIR__ . '/config/*.config.*')
        );

        return $this->config;
    }

    public function loadVendor()
    {
        if (file_exists(__DIR__ . '/build/vendor-dist/autoload.php')) {
            require_once __DIR__ . '/build/vendor-dist/autoload.php';
        } elseif (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require_once __DIR__ . '/vendor/autoload.php';
        }
    }

    public function install(ServiceLocatorInterface $serviceLocator)
    {
        try {
            $apiManager = $serviceLocator->get('Omeka\ApiManager');
            /** @var Response $response */
            $response = $apiManager->search('sites', []);
            /** @var SiteRepresentation[] $sites */
            $sites = $response->getContent();

            foreach ($sites as $site) {
                $formData['o:title'] = 'Login';
                $formData['o:slug'] = 'login';
                $formData['o:site']['o:id'] = $site->id();
                $apiManager->create('site_pages', $formData);

                $formData['o:title'] = 'Register';
                $formData['o:slug'] = 'register';
                $apiManager->create('site_pages', $formData);
            }
        } catch (Throwable $e) {
            // Deal with it.
        }
    }

    public function uninstall(ServiceLocatorInterface $serviceLocator)
    {
        $logger = $serviceLocator->get('Omeka\Logger');
        $settings = $serviceLocator->get('Omeka\Settings');

        $settings->delete('publicuser');

        $apiManager = $serviceLocator->get('Omeka\ApiManager');
        /** @var Response $response */
        $response = $apiManager->search('sites', []);
        /** @var SiteRepresentation[] $sites */
        $sites = $response->getContent();

        foreach ($sites as $site) {
            try {
                $apiManager->delete('site_pages',
                    [
                        'slug' => 'login',
                        'site' => $site->id(),
                    ]);
            } catch (Throwable $e) {
                $logger->info($e->getMessage());
            }

            try {
                $apiManager->delete('site_pages',
                    [
                        'slug' => 'register',
                        'site' => $site->id(),
                    ]);
            } catch (Throwable $e) {
                $logger->info($e->getMessage());
            }
        }
    }

    public function upgrade($oldVersion, $newVersion, ServiceLocatorInterface $serviceLocator)
    {
        $connection = $serviceLocator->get('Omeka\Connection');
        if ('1.0.0' === $oldVersion) {
            $upgradeSql = "UPDATE `module` SET `id` = 'PublicUser' WHERE `id` = 'Kindred'; UPDATE `setting` SET `id` = 'publicuser' WHERE `id` = 'kindred';";
            $connection->exec($upgradeSql);
        } elseif ('1.0.1' === $oldVersion) {
            $sql = 'CREATE TABLE user_canvas_mapping (
                        id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
                        canvas_mapping_id INT,
                        user_id INT,
                        bookmarked INT,
                        complete_count INT,
                        incomplete_count INT,
                        FOREIGN KEY (canvas_mapping_id) REFERENCES iiif_integration_canvas_mapping(id),
                        FOREIGN KEY (user_id) REFERENCES user(id),
                        CONSTRAINT uc_user_canvas UNIQUE (user_id, canvas_mapping_id)
                    );';
            $connection->exec($sql);
        }
        if (version_compare($oldVersion, '1.0.3', '<') && version_compare($newVersion, '1.0.3', '>=')) {
            $sql = '
            CREATE TABLE oauth_access_tokens (
              access_token  VARCHAR(40) NOT NULL,
              client_id     VARCHAR(80),
              user_id       VARCHAR(80),
              expires       TIMESTAMP NOT NULL,
              scope         VARCHAR(4000),
              PRIMARY KEY (access_token)
            );
            CREATE TABLE oauth_authorization_codes (
              authorization_code   VARCHAR(40) NOT NULL,
              client_id            VARCHAR(80),
              user_id              VARCHAR(80),
              redirect_uri         VARCHAR(2000) NOT NULL,
              expires              TIMESTAMP NOT NULL,
              scope                VARCHAR(4000),
              PRIMARY KEY (authorization_code)
            );
            ';
            $connection->exec($sql);
        }

        parent::upgrade($oldVersion, $newVersion, $serviceLocator);
    }

    // PublicUser\Controller\LoginController
    public function onBootstrap(MvcEvent $event)
    {
        parent::onBootstrap($event);

        /** @var EventManager $em */
        $em = $event->getApplication()->getEventManager();
        $em->attach(
            MvcEvent::EVENT_ROUTE,
            [$this, 'authenticateOAuth']
        );

        $this->addAclRules($event->getRouter(), $event->getRequest());

        $event->getRouteMatch();
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $guest = new Role('Transcriber');

        $acl->addRole($guest);
        $acl->addRoleLabel('Transcriber', 'Transcriber');

    }

    private function addAclRules(RouteInterface $router, $request)
    {
        /** @var Acl $acl */
        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $settings = $this->getServiceLocator()->get(PublicUserSettings::class);
        $siteProvider = $this->getServiceLocator()->get(SiteProvider::class);

        $acl->allow(
            null,
            ['Omeka\Entity\Site', 'Omeka\Api\Adapter\SiteAdapter'],
            ['view-all']
        );

        $isOnRoute = new IsOnRouteAssertion($router, $request, [
            'site/publicuser-register-success',
            'site/publicuser-register',
            'site/publicuser-login',
            'site/publicuser-logout',
            'site/publicuser-forgot',
            'site/publicuser-auth',
            'site/publicuser-auth-token',
            'change-password',
        ]);

        $assertionAggregate = new AssertionAggregate();
        $assertionAggregate->setMode(AssertionAggregate::MODE_AT_LEAST_ONE);
        $assertionAggregate->addAssertion(new SiteIsPublicAssertion());
        $assertionAggregate->addAssertion($isOnRoute);

        $acl->allow(
            null,
            ['Omeka\Entity\Site', 'Omeka\Api\Adapter\SiteAdapter', 'Omeka\Api\Adapter\UserAdapter'],
            ['read'],
            $assertionAggregate
        );

        $acl->allow(
            null,
            ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'],
            ['search', 'create', 'change-role', 'create-password', 'activate-user'],
            $assertionAggregate
        );

        $acl->allow(
            null,
            SiteLoginRedirectController::class,
            ['login']
        );

        $acl->allow(
            null,
            LoginController::class,
            ['login', 'logout', 'forgotPassword', 'resetPassword', 'create-password']
        );

        $acl->allow(
            null,
            AuthController::class,
            ['auth', 'token']
        );

        $acl->allow(
            null,
            [
                UserAdapter::class,
                LoginController::class,
            ],
            ['search', 'register', 'thanks'],
            (new AssertionAggregate())
                ->setMode(AssertionAggregate::MODE_AT_LEAST_ONE)
                ->addAssertion(new IsRegistrationPermittedAssertion($siteProvider, $settings))
                ->addAssertion($isOnRoute)
        );

        $acl->allow(
            null,
            [
                AccountController::class,
            ],
            ['profile']
        );
    }

    /**
     * Get this module's configuration form.
     *
     * @param PhpRenderer $renderer
     *
     * @return string
     */
    public function getConfigForm(PhpRenderer $renderer)
    {
        $apiManager = $this->getServiceLocator()->get('Omeka\ApiManager');
        $globalSettings = $this->getServiceLocator()->get('Omeka\Settings');

        $publicuser_settings = $globalSettings->get('publicuser');
        /** @var Response $response */
        $response = $apiManager->search('sites', []);
        /** @var SiteRepresentation[] $sites */
        $sites = $response->getContent();

        $acl = $this->getServiceLocator()->get('Omeka\Acl');
        $roles = $acl->getRoleLabels();

        $form = $this->getServiceLocator()->get('FormElementManager')->get('publicuserconfig',
            [
                'options' => [
                    'sites' => $sites,
                    'roles' => $roles,
                    'settings' => $publicuser_settings,
                ],
            ]
        );

        $view = new ViewModel([
            'form' => $form,
            'sites' => $sites,
        ]);
        $view->setTemplate('config/configform.phtml');

        return $renderer->render($view);
    }

    /**
     * Handle this module's configuration form.
     *
     * @param AbstractController $controller
     *
     * @return bool False if there was an error during handling
     */
    public function handleConfigForm(AbstractController $controller)
    {
        $globalSettings = $this->getServiceLocator()->get('Omeka\Settings');

        $formData = $controller->params()->fromPost();

        $settings = [];

        foreach ($formData as $fieldName => $formValue) {
            if (strstr($fieldName, '__global__')) {
                list(, $fieldNameNormalized) = explode('__global__', $fieldName);
                $settings['__global__'][$fieldNameNormalized] = $formValue;
                unset($formData[$fieldName]);
            }
        }

        foreach ($formData as $fieldName => $formValue) {
            $parts = explode('_', $fieldName);
            $slug = array_shift($parts);
            $settings[$slug][$fieldName] = $formValue;
        }

        $globalSettings->set('publicuser', $settings);

        return true;
    }

    public function authenticateOAuth(MvcEvent $event) {
        $request = $event->getRequest();
        $bearer = $request->getHeaders()->get('Bearer');
        if (!$bearer) {
            return null;
        }
        /** @var TokenService $tokenService */
        $tokenService = $this->getServiceLocator()->get(TokenService::class);
        $accessToken = $tokenService->getAccessToken($bearer->getFieldValue());
        if ($accessToken) {
            /** @var Acl $acl */
            $acl = $this->getServiceLocator()->get('Omeka\Acl');
            $acl->allow(null, ['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
            /** @var Manager $manager */
            $manager = $this->getServiceLocator()->get('Omeka\ApiManager');
            /** @var UserRepresentation $user */
            $user = $manager->read('users', $accessToken->getUserId())->getContent();
            $acl->removeAllow(null,['Omeka\Api\Adapter\UserAdapter', 'Omeka\Entity\User'], ['read']);
            if ($user) {
                /** @var AuthenticationService $auth */
                $auth = $this->getServiceLocator()->get('Omeka\AuthenticationService');
                $auth->getStorage()->write($user->getEntity());
            }
        }
    }

    /**
     * @param SharedEventManagerInterface $sharedEventManager
     */
    public function attachListeners(SharedEventManagerInterface $sharedEventManager)
    {

        $serviceContainer = $this->getServiceLocator();
        $authenticationService = $serviceContainer->get('Omeka\AuthenticationService');
        $user = $authenticationService->getIdentity();

        if ($serviceContainer->has(EventDispatcher::class)) {
            /**
             * @var EventDispatcher
             * @var AnnotationCreatorElucidateSubscriber $elucidateSubscriber
             * @var AuthenticationService $authenticationService
             * @var User $user
             */
            $eventDispatcher = $serviceContainer->get(EventDispatcher::class);
            $elucidateSubscriber = $serviceContainer->get(AnnotationCreatorElucidateSubscriber::class);

            if ($user) {
                $elucidateSubscriber->setUser($user);
                $eventDispatcher->addSubscriber($elucidateSubscriber);
                $eventDispatcher->addSubscriber($serviceContainer->get(AnnotationStatsSubscriber::class));
            }
        }

        $sharedEventManager->attach('*', MvcEvent::EVENT_RENDER, function(MvcEvent $e) use ($user) {
            $layoutViewModel = $e->getViewModel();
            $childViewModels = $layoutViewModel->getChildren();
            if (count($childViewModels) === 0) {
                return;
            }
            $viewModel = $childViewModels[0];

            $viewModel->isLoggedIn = !!$user;
            $viewModel->currentUser = $user;
            $layoutViewModel->setVariable('isLoggedIn', !!$user);
            $layoutViewModel->setVariable('currentUser', $user);
        });
    }
}
