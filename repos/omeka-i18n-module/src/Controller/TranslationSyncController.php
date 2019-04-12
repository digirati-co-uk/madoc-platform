<?php

namespace i18n\Controller;

use i18n\Job\TransifexExportJob;
use i18n\Job\TransifexItemExportJob;
use Omeka\Api\Manager;
use Omeka\Job\Dispatcher;
use Zend\Form\Element\Button;
use Zend\Form\Element\Hidden;
use Zend\Form\Form;
use Zend\Http\Response;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class TranslationSyncController extends AbstractActionController
{
    /**
     * @var Dispatcher
     */
    private $jobDispatcher;

    /**
     * @var Manager
     */
    private $api;
    /**
     * @var bool
     */
    private $isEnabled;

    public function __construct(
        Dispatcher $jobDispatcher,
        Manager $api,
        bool $isEnabled
    ) {
        $this->jobDispatcher = $jobDispatcher;
        $this->api = $api;
        $this->isEnabled = $isEnabled;
    }

    public function showAction()
    {
        $form = new Form();
        $form->add(new Hidden('dummy'));
        $submitButton = new Button('submit');
        $submitButton->setLabel('Synchronize');

        return (new ViewModel(
            [
                'form' => $form,
                'isEnabled' => $this->isEnabled,
            ]
        ))->setTemplate('admin/i18n-synchronize/show');
    }

    public function processAction()
    {
        if (!$this->isEnabled) return null;

        $this->jobDispatcher->dispatch(TransifexItemExportJob::class, []);

        foreach ($this->api->search('sites')->getContent() as $site) {
            $this->jobDispatcher->dispatch(
                TransifexExportJob::class,
                [
                    'site_slug' => $site->slug(),
                ]
            );
        }

        return (new ViewModel())->setTemplate('admin/i18n-synchronize/process');
    }
}
