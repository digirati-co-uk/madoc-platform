<?php

namespace i18n\Site;


use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\Navigation\Link\LinkInterface;
use Omeka\Site\Navigation\Translator;

class NavigationTranslator extends Translator
{

    /**
     * {@inheritdoc}
     *
     * This overrides a single line in this single method. It wraps the label in a translate
     * call in order for it to be picked up by Zend and translated.
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
