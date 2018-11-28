<?php

use Comments\Plugin\StaticCommentPlugin;
use Comments\Controller\CommentsController;

return [
    'controllers' => [
        'factories' => [
            CommentsController::class => function () {
                return new CommentsController(
                    // Will eventually be driven by configuration.
                    new StaticCommentPlugin()
                );
            },
        ],
    ],
];
