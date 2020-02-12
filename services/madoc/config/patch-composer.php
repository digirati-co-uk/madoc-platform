#!/usr/bin/env php
<?php
$composerFile = file_get_contents('composer.json');
$composerJson = json_decode($composerFile, true);

$composerJson['require']['wikimedia/composer-merge-plugin'] = '1.4.1';
$composerJson['require']['kokspflanze/zfc-twig'] = '2.2.0';

$repos = array_diff(
    scandir(getcwd()  . '/packages'), ['..', '.', '.DS_Store']
);

foreach ($repos as $repo) {
    $composeFileLocation = getcwd()  . '/packages/'. $repo . '/composer.json';
    if (file_exists($composeFileLocation)) {
        $composer = json_decode(file_get_contents($composeFileLocation), true);
        if (!isset($composerJson['require'][$composer['name']]) && isset($composer['version'])) {
            $composerJson['require'][$composer['name']] = $composer['version'];
        }
    }
}

$composerJson['extra']['merge-plugin'] = [
    "include" => [
        "packages/*/composer.json"
    ],
];

$composerJson['repositories'] = array_merge(
    [
        [
            "type" => "path",
            "url" => "application/data/composer-addon-installer"
        ]
    ],
    array_map(
        function ($dir) {
            return [
                'type' => 'path',
                'url' => 'packages/' . $dir
            ];
        },
        $repos
    )
);


file_put_contents('composer.json', json_encode($composerJson, JSON_PRETTY_PRINT));
