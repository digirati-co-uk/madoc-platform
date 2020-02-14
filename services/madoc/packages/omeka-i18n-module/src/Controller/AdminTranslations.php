<?php

namespace i18n\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use i18n\Admin\TranslationGroups\MadocTranslationGroup;
use i18n\Admin\TranslationGroups\OmekaTranslationGroup;
use i18n\Admin\TranslationGroups\PageTranslationGroup;
use i18n\Admin\TranslationGroups\SiteNavigationTranslationGroup;
use i18n\Admin\TranslationGroups\SiteThemeTranslationGroup;
use i18n\Admin\TranslationGroups\TranslationGroup;
use Omeka\I18n\Translator;
use Omeka\Mvc\Exception\NotFoundException;
use Omeka\Media\Renderer\Manager;
use Zend\Diactoros\Response\TextResponse;
use Zend\View\Model\ViewModel;

class AdminTranslations extends AbstractPsr7ActionController
{
    /**
     * @var \Zend\I18n\Translator\Translator
     */
    private $translator;

    private $groups = [];
    private $siteGroups = [];
    /**
     * @var Manager
     */
    private $manager;

    public function __construct(Translator $translator, Manager $manager)
    {
        $this->translator = $translator->getDelegatedTranslator();
        $this->groups = [
            'omeka-core' => new OmekaTranslationGroup(),
            'madoc' => new MadocTranslationGroup(),
        ];
        $this->manager = $manager;
    }

    public function getSiteGroups()
    {
        if (!$this->siteGroups) {
            $site = $this->currentSite();
            $this->siteGroups = [
                'theme' => new SiteThemeTranslationGroup($site),
                'navigation' => new SiteNavigationTranslationGroup($site),
                'pages' => new PageTranslationGroup($site, $this->manager)
            ];
        }

        return $this->siteGroups;
    }

    public function viewGroupAction() {

        $id = $this->params('group-id');

        /** @var TranslationGroup $group */
        $group = $this->groups[$id] ?? $this->getSiteGroups()[$id] ?? null;

        if (!$group) {
            throw new NotFoundException();
        }

        return new ViewModel([
            'group' => $group
        ]);
    }

    public function viewGroupListAction() {
        $id = $this->params('group-id');
        /** @var TranslationGroup $group */
        $group = $this->groups[$id] ?? $this->getSiteGroups()[$id] ?? null;

        if (!$group) {
            throw new NotFoundException();
        }

        return new ViewModel([
            'group' => $group
        ]);
    }

    public function viewLanguageAction() {
        $id = $this->params('group-id');
        $lang = $this->params('lang');

        /** @var TranslationGroup $group */
        $group = $this->groups[$id] ?? $this->getSiteGroups()[$id] ?? null;

        if (!$group) {
            throw new NotFoundException();
        }

        return new ViewModel([
            'group' => $group,
            'label' => \Locale::getDisplayName($lang),
            'messages' => $group->getLanguage($lang),
        ]);
    }

    public function downloadTemplateAction()
    {
        $id = $this->params('group-id');
        /** @var TranslationGroup $group */
        $group = $this->groups[$id] ?? $this->getSiteGroups()[$id] ?? null;

        $template = <<<'POT'
msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\n"
"Content-Transfer-Encoding: 8bit\n"
"Language: en_GB\n"



POT;
        foreach ($group->getTemplate() as $key => $value) {
            $template .= "msgid \"$key\"\n";
            $template .= "msgstr \"\"\n\n";
        }

        return new TextResponse($template, 200, [
            'Content-Disposition' => 'attachment; filename="template.pot"'
        ]);
    }

    public function listAction()
    {
        return new ViewModel([
            'locale' => $this->translator->getLocale(),
            'messages' => $this->translator->getAllMessages(),
            'groups' => $this->groups,
            'siteGroups' => $this->getSiteGroups(),
        ]);
    }

}
