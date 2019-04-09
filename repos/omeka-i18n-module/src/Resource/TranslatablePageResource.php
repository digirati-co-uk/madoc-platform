<?php

namespace i18n\Resource;

use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;

class TranslatablePageResource implements TranslatableResource
{
    /**
     * @var SitePageRepresentation
     */
    private $page;

    /**
     * A collection of functions that take {@code (SitePageRepresentation, SitePageBlockRepresentation)}
     * as input and return a string value for that page / block pair.
     *
     * @return array|\Closure[]
     */
    public static function blockExtractors()
    {
        return [
            'pageTitle' => function ($page, $block) {
                return $page->title();
            },
            'html' => self::blockData('html'),
        ];
    }

    /**
     * Returns a closure that extracts the given data {@code key} from a passed in block.
     *
     * @param string $key
     *
     * @return \Closure
     */
    public static function blockData(string $key)
    {
        return function (SitePageRepresentation $page, SitePageBlockRepresentation $block) use ($key) {
            return (string) $block->dataValue($key);
        };
    }

    public function __construct(SitePageRepresentation $page)
    {
        $this->page = $page;
    }

    public function getMessages()
    {
        $blockExtractors = self::blockExtractors();

        foreach ($this->page->blocks() as $block) {
            $layout = $block->layout();
            if (!array_key_exists($layout, $blockExtractors)) {
                continue;
            }

            $data = call_user_func_array(
                $blockExtractors[$layout],
                [
                    $this->page,
                    $block,
                ]
            );

            $id = sprintf('%s_%d', $layout, $block->id());
            yield $id => $data;
        }
    }

    public function getIdentifier()
    {
        $project = $this->page->site()->slug();

        return TranslatableResourceIdentifier::forResource('page', $this->page->slug())->setProject($project);
    }
}
