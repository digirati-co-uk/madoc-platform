<?php

use Digirati\OmekaShared\Factory\EventDispatcherFactory;
use Digirati\OmekaShared\Factory\UrlHelperFactory;
use Digirati\OmekaShared\Helper\UrlHelper;
use Doctrine\Common\Cache\ArrayCache;
use Doctrine\Common\Cache\ChainCache;
use Doctrine\Common\Cache\PhpFileCache;
use Elucidate\Adapter\GuzzleHttpAdapter;
use Elucidate\Client as ElucidateClient;
use Elucidate\ClientInterface;
use Elucidate\EventAwareClient;
use ElucidateModule\Config\ElucidateModuleConfiguration;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\Topics\TopicType;
use ElucidateModule\Domain\Topics\TopicTypeRepository;
use ElucidateModule\Domain\ViewEventSubscriber;
use ElucidateModule\Mapping\OmekaItemMapper;
use ElucidateModule\Service\SearchClient;
use ElucidateModule\Service\TacsiClient;
use ElucidateModule\Site\BlockLayout\LatestAnnotations;
use ElucidateModule\Subscriber\AnnotationModerationSubscriber;
use ElucidateModule\Subscriber\BookmarkSubscriber;
use ElucidateModule\Subscriber\CommentSubscriber;
use ElucidateModule\Subscriber\CompletionSubscriber;
use ElucidateModule\Subscriber\CreatedTimestampSubscriber;
use ElucidateModule\Subscriber\ElucidateItemImporter;
use ElucidateModule\Subscriber\FlaggingNotificationSubscriber;
use ElucidateModule\Subscriber\FlaggingSubscriber;
use ElucidateModule\Subscriber\TaggingSubscriber;
use ElucidateModule\Subscriber\TranscriptionSubscriber;
use ElucidateModule\Subscriber\UserBookmarksSubscriber;
use ElucidateModule\View\CanvasView;
use ElucidateModule\View\ManifestView;
use GuzzleHttp\HandlerStack;
use Interop\Container\ContainerInterface;
use Kevinrob\GuzzleCache\CacheMiddleware;
use Kevinrob\GuzzleCache\KeyValueHttpHeader;
use Kevinrob\GuzzleCache\Storage\DoctrineCacheStorage;
use Kevinrob\GuzzleCache\Strategy\GreedyCacheStrategy;
use Kevinrob\GuzzleCache\Strategy\PublicCacheStrategy;
use Symfony\Component\EventDispatcher\EventDispatcher;
use Zend\Uri\Uri;

if (!defined('ELUCIDATE_URL')) {
    define(
        'ELUCIDATE_URL',
        getenv('OMEKA__ELUCIDATE_URL') . '/annotation/w3c/'
    );
}

return [
    'service_manager' => [
        'factories' => [
            // From the shared library
            UrlHelper::class => UrlHelperFactory::class,
            EventDispatcher::class => EventDispatcherFactory::class,

            // Everything else.
            SearchClient::class => function (ContainerInterface $c) {
                return new SearchClient(
                    getenv('OMEKA__SEARCH_SERVICE'),
                    $c->get('Omeka\Connection'),
                    $c->get(UrlHelper::class)
                );
            },
            ElucidateAnnotationMapper::class => function (ContainerInterface $c) {
                return new ElucidateAnnotationMapper(
                    $c->get('Omeka\ApiManager'),
                    $c->get(\GuzzleHttp\Client::class),
                    $c->get('mapping_cache'),
                    $c->get(UrlHelper::class),
                    $c->get('Omeka\Logger')
                );
            },
            'mapping_cache' => function ($c) {
                return new ChainCache([
                    new ArrayCache(),
                ]);
            },
            OmekaItemMapper::class => function (ContainerInterface $c) {
                return new OmekaItemMapper($c->get('Omeka\ApiManager'), $c->get(\GuzzleHttp\Client::class));
            },
            ElucidateItemImporter::class => function (ContainerInterface $c) {
                return new ElucidateItemImporter(
                    $c->get(OmekaItemMapper::class),
                    $c->get(UrlHelper::class)
                );
            },
            ElucidateModuleConfiguration::class => function ($c) {
                return new ElucidateModuleConfiguration($c->get('Config'));
            },
            UserBookmarksSubscriber::class => function (ContainerInterface $c) {
                return new UserBookmarksSubscriber(
                    $c->get(SearchClient::class)
                );
            },
            ViewEventSubscriber::class => function () {
                return new ViewEventSubscriber();
            },
            AnnotationModerationSubscriber::class => function ($c) {
                return new AnnotationModerationSubscriber(
                    getenv('OMEKA__ELUCIDATE_PUBLIC_DOMAIN') ?? '',
                    $c->get(UrlHelper::class),
                    $c->get(ElucidateModuleConfiguration::class)
                );
            },
            BookmarkSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new BookmarkSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            FlaggingSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new FlaggingSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            CommentSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new CommentSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            CompletionSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new CompletionSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            TranscriptionSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new TranscriptionSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            TaggingSubscriber::class => function (ContainerInterface $c) {
                $elucidate = $c->has(ClientInterface::class) ? $c->get(ClientInterface::class) : $c->get(ClientInterface::class);

                return new TaggingSubscriber(
                    ELUCIDATE_URL,
                    $elucidate
                );
            },
            CreatedTimestampSubscriber::class => function () {
                return new CreatedTimestampSubscriber();
            },
            CanvasView::class => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new CanvasView(
                    $c->get(ClientInterface::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    [
                        'path' => $config->get('elucidate_item_endpoint'),
                        'field_name' => $config->get('elucidate_search_field_name'),
                        'field_is_property' => $config->get('elucidate_search_field_is_property'),
                        'search_using_class' => $config->get('elucidate_search_search_using_class'),
                        'has_virtual' => $config->get('elucidate_search_has_virtual'),
                        'virtual_prefix' => $config->get('elucidate_search_virtual_prefix'),
                        'search_uri' => $config->get('elucidate_search_search_uri'),
                        'search_https' => $config->get('elucidate_search_search_https'),
                        'search_by_id' => $config->get('elucidate_search_by_id'),
                        'transcriptions_endpoint' => $config->get('elucidate_transcriptions_endpoint'),
                    ],
                    $c->get(UrlHelper::class),
                    $c->get('Omeka\AuthenticationService'),
                    $c->get(\GuzzleHttp\Client::class)
                );
            },
            ManifestView::class => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new ManifestView(
                    $c->get(ClientInterface::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    [
                        'path' => $config->get('elucidate_item_endpoint'),
                        'field_name' => $config->get('elucidate_search_field_name'),
                        'field_is_property' => $config->get('elucidate_search_field_is_property'),
                        'search_using_class' => $config->get('elucidate_search_search_using_class'),
                        'has_virtual' => $config->get('elucidate_search_has_virtual'),
                        'virtual_prefix' => $config->get('elucidate_search_virtual_prefix'),
                        'search_uri' => $config->get('elucidate_search_search_uri'),
                        'search_https' => $config->get('elucidate_search_search_https'),
                        'search_by_id' => $config->get('elucidate_search_by_id'),
                    ],
                    $c->get(UrlHelper::class)
                );
            },
            \GuzzleHttp\Client::class => function () {
                $stack = HandlerStack::create();

                $cacheChain = new ChainCache(
                    [
                        new ArrayCache(),
                    ]
                );

                $cacheStorage = new DoctrineCacheStorage($cacheChain);
                $stack->push(
                    new CacheMiddleware(
                        new GreedyCacheStrategy(
                            $cacheStorage,
                            36 * 60 * 60,
                            new KeyValueHttpHeader(['Last-Modified'])
                        )
                    )
                );

                $stack->push(new CacheMiddleware(new PublicCacheStrategy($cacheStorage)));

                return new \GuzzleHttp\Client([
                    'handler' => $stack,
                ]);
            },
            'elucidate.guzzle' => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new GuzzleHttpAdapter(
                    new GuzzleHttp\Client(['base_uri' => ELUCIDATE_URL])
                );
            },
            'mathmos.guzzle' => function (ContainerInterface $c) {
                $config = $c->get('Omeka\Settings');

                return new GuzzleHttpAdapter(
                    new GuzzleHttp\Client(['base_uri' => $config->get('mathmos_server_url', 'http://mathmos.dlcs-ida.org/search/')])
                );
            },
            ElucidateClient::class => function ($c) {
                return $c->get(ClientInterface::class);
            },
            ClientInterface::class => function (ContainerInterface $c) {
                return new EventAwareClient(
                    new ElucidateClient($c->get('elucidate.guzzle')),
                    $c->get(EventDispatcher::class)
                );
            },

            FlaggingNotificationSubscriber::class => function (ContainerInterface $c) {
                return new FlaggingNotificationSubscriber(
                    $c->get('Omeka\ApiManager'),
                    $c->get('Omeka\Acl'),
                    $c->get('Omeka\Mailer'),
                    $c->get('Omeka\Logger')
                );
            },

            'topic_types' => function () {
                return [
                    new TopicType('Roll', true, 'roll'),
                    new TopicType('Series', true, 'series'),
                    new TopicType('Theme', true, 'theme'),
                    new TopicType('Collection', true, 'collection'),
                    new TopicType('Tribe', true, 'tribe'),
                    new TopicType('Person', true, 'person'),
                    new TopicType('School', true, 'school'),
                    new TopicType('Organization', true, 'org'),
                    new TopicType('Place', true, 'gpe', 'loc', 'place', 'fac'),
                    new TopicType('Product', false, 'product'),
                ];
            },

            TopicTypeRepository::class => function (ContainerInterface $c) {
                $config = $c->get('Config');
                $tacsi = $config['tacsi_uri'] ?: '';
                if (!$tacsi) {
                    $settings = $c->get('Omeka\Settings');
                    $tacsi = $settings->get('elucidate_tacsi_url');
                }

                return new TopicTypeRepository(...(empty($tacsi) ? [] : $c->get('topic_types')));
            },

            TacsiClient::class => function (ContainerInterface $c) {
                $config = $c->get('Config');
                $tacsi = $config['tacsi_uri'] ?: '';
                if (!$tacsi) {
                    $settings = $c->get('Omeka\Settings');
                    $tacsi = $settings->get('elucidate_tacsi_url');
                }

                return new TacsiClient(new GuzzleHttp\Client(), $tacsi);
            },
        ],
    ],
    'block_layouts' => [
        'factories' => [
            LatestAnnotations::class => function (ContainerInterface $c) {
                return new LatestAnnotations(
                    $c->get(ElucidateClient::class),
                    $c->get(ElucidateAnnotationMapper::class),
                    $c->get('Omeka\Logger'),
                    $c->get('ZfcTwig\View\TwigRenderer')
                );
            },
        ],
    ],
];
