<?php


use Digirati\OmekaShared\Factory\LocaleHelperFactory;
use Digirati\OmekaShared\Framework\PageBlockMediaAdapter;
use Digirati\OmekaShared\Helper\LocaleHelper;
use MadocSearch\Media\AnnotationStatisticsIngester;
use MadocSearch\Media\AnnotationStatisticsRenderer;
use Psr\Container\ContainerInterface;

return [
    'service_manager' => [
        'factories' => [
            LocaleHelper::class => LocaleHelperFactory::class,
            AnnotationStatisticsIngester::class => function () {
                return new AnnotationStatisticsIngester();
            },
            AnnotationStatisticsRenderer::class => function (ContainerInterface $c) {
                return new AnnotationStatisticsRenderer(
                    $c->get('ZfcTwig\View\TwigRenderer')
                );
            },
        ],
    ],
    'block_layouts' => [
        'factories' => [
            'annotation-statistics' => function (ContainerInterface $c) {
                return new PageBlockMediaAdapter(
                    $c->get(AnnotationStatisticsIngester::class),
                    $c->get(AnnotationStatisticsRenderer::class),
                    $c->get(LocaleHelper::class)
                );
            }
        ],
    ],
];
