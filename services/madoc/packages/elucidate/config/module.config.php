<?php

return [
    'view_manager' => [
        'template_path_stack' => [
            realpath(__DIR__.'/../view'),
        ],
    ],
    'tacsi_uri' => '',
    'moderation' => [
        'enabled_resources' => [
            'iiif',
            'annotations',
        ],
        'redact_immediately' => true,
        'default_status' => [
            'commenting' => 'unapproved',
            'transcribing' => 'unapproved',
            'tagging' => 'approved',
        ],
    ],
];
