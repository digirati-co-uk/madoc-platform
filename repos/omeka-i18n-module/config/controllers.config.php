<?php
/**
 * Controllers
 * There are a few ways to perform DI for controllers. The two most common to use will
 * be typical container injection as below, where the closure receives the container
 * and returns your dependency.
 * Other ways include:
 * Invokable factory:
 * [ MyNonConstructableController::class => \Zend\ServiceManager\Factory\InvokableFactory::class ]
 * This method is shorter and useful for controllers without dependencies.
 * Full factory:
 * [ MyNonConstructableController::class => MyCustomFactory::class ]
 * This is a fully formed factory where the class MyCustomFactory contains an __invoke() method
 * that receives the container much like the closure. The difference being it can be a service
 * itself and constructed separately, allowing for greater control of how the chain of dependencies
 * is managed. For example, a 3rd party could construct a Factory that is used in multiple places
 * and leverage full control of how the dependencies are created.
 */

namespace i18n\Controller;

use Psr\Container\ContainerInterface;
use Zend\Validator\Translator\TranslatorInterface;

return [
    'controllers' => [
        'factories' => [
            TransifexExportController::class => function ($c) {
                return new TransifexExportController();
            },

            TranslationSyncController::class => function ($c) {
                return new TranslationSyncController($c->get('Omeka\JobDispatcher'), $c->get('Omeka\ApiManager'));
            },

            LanguageSelectionController::class => function ($c) {
                return new LanguageSelectionController();
            },
            AdminTranslations::class => function (ContainerInterface $c) {
                return new AdminTranslations(
                    $c->get('Zend\I18n\Translator\TranslatorInterface'),
                    $c->get('Omeka\Media\Renderer\Manager')
                );
            },
        ],
    ],
];
