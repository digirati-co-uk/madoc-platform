<?php

use AnnotationStudio\CaptureModel\CaptureModelRepository;
use AnnotationStudio\CaptureModel\Router;
use AnnotationStudio\Subscriber\ModerationStatusVerificationSubscriber;
use Digirati\OmekaShared\Factory\SettingsHelperFactory;
use Digirati\OmekaShared\Factory\UrlHelperFactory;
use Digirati\OmekaShared\Helper\SettingsHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use Omeka\Settings\Settings;
use Psr\Container\ContainerInterface;
use Zend\Http\Request;
use Zend\I18n\Translator\TranslatorInterface;

return [
    'service_manager' => [
        'factories' => [
            CaptureModelRepository::class => function (ContainerInterface $c) {
                return new CaptureModelRepository(
                    $c->get('Omeka\ApiManager'),
                    $c->get(Router::class),
                    $c->get(TranslatorInterface::class)
                );
            },
            UrlHelper::class => UrlHelperFactory::class,
            SettingsHelper::class => SettingsHelperFactory::class,
            Router::class => function (ContainerInterface $c) {
                return new Router(
                    $c->get(UrlHelper::class),
                    getenv('OMEKA__ELUCIDATE_PUBLIC_DOMAIN')
                );
            },
            ModerationStatusVerificationSubscriber::class => function (ContainerInterface $c) {
                /** @var Settings $config */
                $config = $c->get('Omeka\Settings');
                /** @var Request $request */
                $request = $c->get('Request');

                return new ModerationStatusVerificationSubscriber(
                    $request->getUri(),
                    $config->get('annotation_studio_default_moderation_status', 'open')
                );
            },
        ],
    ],
];
