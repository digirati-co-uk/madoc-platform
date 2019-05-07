<?php

namespace i18n\Site;


use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Site\Navigation\Translator;

class NavigationTranslator extends Translator
{

    /**
     * Get the label for a link.
     *
     * User-provided labels should be used as-is, while system-provided "backup" labels
     * should be translated.
     *
     * @param LinkInterface $linkType
     * @param array $data
     * @param SiteRepresentation $site
     * @return string
     */
    public function getLinkLabel(LinkInterface $linkType, array $data, SiteRepresentation $site)
    {
        /** @var string $label */
        $label = $linkType->getLabel($data, $site);
        if ($label) {
            return $this->i18n->translate($label);
        }
        return $this->i18n->translate($linkType->getName());
    }

}
