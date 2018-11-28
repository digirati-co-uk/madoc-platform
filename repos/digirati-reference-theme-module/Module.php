<?php

namespace DigiratiReferenceTheme;

use Omeka\Module\AbstractModule;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use SplFileInfo;

class Module extends AbstractModule
{

    public function resolveTemplates($path) {
        $rii = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path));
        $files = [];
        foreach ($rii as $file) {
            /** @var SplFileInfo $file */
            if (
                $file->isDir() ||
                $file->getExtension() === 'phtml'
            ) {
                continue;
            }

            $filename = implode('.', array_slice(explode('.', $file->getPathname()), 0, -1));
            $prefixLength = strlen(realpath($path)) + 2;
            $templateName = substr($filename, $prefixLength);
            $files[$templateName] = $file->getPathname();
        }
        return $files;
    }

    public function getConfig()
    {
        return [
            'view_manager' => [
                'template_map' => $this->resolveTemplates( OMEKA_PATH . '/themes/digirati-reference-theme/view/'),
            ]
        ];
    }
}
