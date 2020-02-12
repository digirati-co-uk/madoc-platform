<?php

namespace Digirati\OmekaShared\Framework;

use Digirati\OmekaShared\Helper\SitePermissionsHelper;
use Digirati\OmekaShared\Utility\OmekaValue;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Entity\User;
use Zend\View\Renderer\PhpRenderer;

trait RenderMedia
{
    protected $currentMedia = null;

    public function render(
        PhpRenderer $view,
        MediaRepresentation $media,
        array $options = []
    ) {
        $this->currentMedia = $media;
        $data = $media->mediaData();

//        if (isset($data[AbstractIngester::SITE_ROLE_ID])) {
//            /** @var User $user */
//            $user = $media->getServiceLocator()->get('Omeka\AuthenticationService')->getIdentity();
//            // Get the role from the site.
//            $role = SitePermissionsHelper::userRoleForSite($user, $site);
//            if (!in_array($role, $data[AbstractIngester::SITE_ROLE_ID])) {
//                return '';
//            }
//        }

        if ($this instanceof LocalisedMedia) {
            $locale = $data['locale'] ?? null;
            $pageLocale = $this->getLang();
            if (
                $pageLocale &&
                $locale &&
                $locale !== 'default' &&
                OmekaValue::langMatches($locale, $pageLocale) === false
            ) {
                return '';
            }
        }

        if ($this instanceof TranslatableRenderer) {
            $names = $this->getTranslatableFieldNames();
            /** @var \Zend\I18n\Translator\TranslatorInterface $translator */
            $translator = $media->getServiceLocator()->get('Zend\I18n\Translator\TranslatorInterface')->getDelegatedTranslator();

            foreach ($names as $key) {
                $data[$key] = $translator->translate($data[$key], 'default:page_block');
            }
        }

        if ($this instanceof MediaPageBlockDualRender) {
            return $this->renderFromData($view, $data, $options);
        }

        return '';
    }

    public function getCurrentMedia()
    {
        return $this->currentMedia;
    }
}
