<?php

use CaptureModelImport\Controller\CaptureModelImportController;
use CaptureModelImport\Service\Controller\CaptureModelImportControllerFactory;

return [
    'controllers' => [
        'factories' => [
          CaptureModelImportController::class => CaptureModelImportControllerFactory::class,
        ],
    ],
];
