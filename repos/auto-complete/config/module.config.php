<?php

return [
    'view_manager' => [
        'strategies' => ['ViewJsonStrategy'],
    ],
    'controllers' => [
        'factories' => [
            'ResourceProvider\Controller\Api\ReadCaptureModel' => 'ResourceProvider\Service\Controller\Api\ReadCaptureModelFactory',
            'ResourceProvider\Controller\Api\Augment' => 'ResourceProvider\Service\Controller\Api\AugmentControllerFactory',
        ],
    ],
];
