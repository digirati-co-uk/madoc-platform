<?php
$reader = new Zend\Config\Reader\Ini;

if (!defined('OMEKA_PATH')) {
    define('OMEKA_PATH', __DIR__ . 'omeka-workspace/');
}

return [
    'modules' => [
        'Zend\Form',
        'Zend\I18n',
        'Zend\Mvc\I18n',
        'Zend\Mvc\Plugin\Identity',
        'Zend\Navigation',
        'Zend\Router',
        'Omeka',
        'ZfcTwig'
    ],
    'thumbnails' => [
        'types' => [
            'large' => ['constraint' => 384],
            'medium' => ['constraint' => 256],
            'square' => ['constraint' => 256],
        ],
        'thumbnailer_options' => [
            'imagemagick_dir' => null,
        ],
    ],
    'module_listener_options' => [
        'module_paths' => [
            'Omeka' => OMEKA_PATH . '/application',
            OMEKA_PATH . '/modules',
        ],
        'config_glob_paths' => [
            OMEKA_PATH . '/config/local.config.php'
        ]
    ],
    'service_manager' => [
        'aliases' => [
            'Omeka\File\Store' => 'Omeka\File\Store\Local',
            'Omeka\File\Thumbnailer' => 'Omeka\File\Thumbnailer\ImageMagick',
        ],
        'factories' => [
            'Omeka\Connection' => 'Omeka\Service\ConnectionFactory',
            'Omeka\ModuleManager' => 'Omeka\Service\ModuleManagerFactory',
            'Omeka\Status' => 'Omeka\Service\StatusFactory',
        ],
    ],
    'mail' => [
        'transport' => [
            'type' => 'sendmail',
            'options' => [],
        ],
        'default_message_options' => [
            'encoding' => 'UTF-8',
        ],
    ],
    'connection' => $reader->fromFile(OMEKA_PATH . '/config/database.ini'),
];
