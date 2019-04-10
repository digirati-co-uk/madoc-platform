<?php

namespace i18n;

/*
 * Services
 *
 * Services can be defined in factories and invokables just likes controllers. See
 * the comments there for different options for maintaining a DI container.
 *
 * Note: in this example we are requiring Guzzle only as an example of a very
 * common library pulled in. Factory|Event
 */

use Digirati\OmekaShared\Factory\LocaleHelperFactory;
use Digirati\OmekaShared\Factory\UrlHelperFactory;
use Digirati\OmekaShared\Helper\LocaleHelper;
use Digirati\OmekaShared\Helper\UrlHelper;
use Doctrine\Common\Cache\ArrayCache;
use Doctrine\Common\Cache\ChainCache;
use Doctrine\Common\Cache\FilesystemCache;
use GuzzleHttp\Client;
use GuzzleHttp\HandlerStack;
use i18n\Event\TransifexProjectListener;
use i18n\Event\TranslatableResourceListener;
use i18n\Event\TranslationMissingListener;
use i18n\Factory\TransifexClientFactory;
use i18n\Factory\TransifexObjectFactory;
use i18n\Loader\TransifexCoreMessageLoader;
use i18n\Loader\TransifexResourceMessageLoader;
use i18n\Loader\TransifexThemeMessageLoader;
use i18n\Resource\Exporter\TransifexResourceExporter;
use i18n\Resource\Exporter\TranslatableResourceExporter;
use i18n\Resource\TranslatableResourceManager;
use i18n\Resource\Writer\JsonResourceWriter;
use i18n\Resource\Writer\TranslatableResourceWriter;
use i18n\Site\LocalizationListener;
use i18n\Site\SiteListener;
use i18n\Translator\ContextualTranslator;
use i18n\Translator\DelegateTranslatorFactory;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\Storage\DoctrineCacheStorage;
use Kevinrob\GuzzleCache\Strategy\PublicCacheStrategy;
use Psr\Container\ContainerInterface;
use Zend\I18n\Translator\TranslatorInterface;

return [
    'service_manager' => [
        'factories' => [
            LocaleHelper::class => LocaleHelperFactory::class,
            UrlHelper::class => UrlHelperFactory::class,

            'transifex.projects' => TransifexObjectFactory::class,
            'transifex.resources' => TransifexObjectFactory::class,
            'transifex.translations' => TransifexObjectFactory::class,
            'transifex' => TransifexClientFactory::class,

            TransifexProjectListener::class => function ($container) {
                return new TransifexProjectListener(
                    $container->get('transifex.projects'),
                    $container->get('Omeka\Settings'),
                    $container->get('Omeka\Settings\Site')
                );
            },

            TranslatableResourceListener::class => function ($container) {
                return new TranslatableResourceListener(
                    $container->get('Omeka\Logger'),
                    $container->get('Omeka\Settings'),
                    $container->get('Omeka\Settings\Site'),
                    $container->get(TranslatableResourceExporter::class),
                    $container->get(TranslatableResourceWriter::class)
                );
            },

            'i18n.guzzle.client' => function ($container) {
                $stack = HandlerStack::create();
                $stack->push(
                    new CacheMiddleware(
                        new PublicCacheStrategy(
                            new DoctrineCacheStorage(
                                new ChainCache(
                                    [
                                        new ArrayCache(),
                                        new FilesystemCache(OMEKA_PATH.'/files'),
                                    ]
                                )
                            )
                        )
                    ),
                    'cache'
                );

                return new Client(
                    [
                        'base_uri' => 'https://www.transifex.com',
                        'handler' => $stack,
                    ]
                );
            },

            SiteListener::class => function (ContainerInterface $container) {
                return new SiteListener(
                    $container->get(LocaleHelper::class),
                    $container->get(UrlHelper::class)
                );
            },

            ContextualTranslator::class => function ($container) {
                return new ContextualTranslator($container->get('MvcTranslator'));
            },

            TransifexResourceMessageLoader::class => function ($container) {
                return new TransifexResourceMessageLoader(
                    $container->get('Omeka\Logger'),
                    $container->get('transifex.translations')
                );
            },

            TransifexCoreMessageLoader::class => function ($container) {
                return new TransifexCoreMessageLoader(
                    $container->get('Omeka\Logger'),
                    $container->get('transifex.translations')
                );
            },

            TransifexThemeMessageLoader::class => function ($container) {
                return new TransifexThemeMessageLoader(
                    $container->get('Omeka\Logger'), $container->get('transifex.translations')
                );
            },

            LocalizationListener::class => function ($container) {
                $settings = $container->get('Omeka\Settings');
                $siteSettings = $container->get('Omeka\Settings\Site');

                return new LocalizationListener(
                    $settings,
                    $siteSettings,
                    $container->get(TranslatorInterface::class)
                );
            },

            TranslatableResourceExporter::class => function ($container) {
                return new TransifexResourceExporter(
                    $container->get('Omeka\Logger'),
                    $container->get('transifex.resources'),
                    $container->get('transifex.translations')
                );
            },

            TranslatableResourceManager::class => function ($container) {
                return new TranslatableResourceManager($container->get('Omeka\ApiManager'));
            },

            TranslatableResourceWriter::class => function () {
                return new JsonResourceWriter();
            },

            TranslationMissingListener::class => function ($container) {
                return new TranslationMissingListener(
                    $container->get('Omeka\Logger'),
                    $container->get('transifex.translations')
                );
            },
        ],
        'delegators' => [
            TranslatorInterface::class => [
                DelegateTranslatorFactory::class,
            ],
        ],
    ],
    'listeners' => [
        SiteListener::class,
    ],
];
