<?php

namespace ElucidateModule\Admin;

use Elucidate\Model\Annotation;
use ElucidateModule\Subscriber\ElucidateItemImporter;
use Omeka\Mvc\Controller\Plugin\Messenger;
use Omeka\Settings\Settings;
use Zend\Form\Form;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

/**
 * @method Settings  settings()
 * @method Messenger messenger()
 * @method Form      getForm(string $formClass)
 */
class ImportAnnotationController extends AbstractActionController
{
    private $importer;

    public function __construct(ElucidateItemImporter $importer)
    {
        $this->importer = $importer;
    }

    public function formAction($withFormData = null, $error = null)
    {
        $form = $this->getForm(ImportAnnotationForm::class);
        if ($withFormData) {
            $form->setData($withFormData);
        }

        return (new ViewModel([
            'form' => $form,
            'error' => $error,
        ]))->setTemplate('elucidate/admin/import-annotation/form');
    }

    public function processAction()
    {
        $form = new ImportAnnotationForm();
        $form->init();
        $form->setData($this->params()->fromPost());
        if (!$form->isValid()) {
            return $this->formAction($form->getData(), 'Something went wrong.');
        }
        $formData = $form->getData();

        // Do something?
        $annotation = $formData['annotation_body'];
        $item = $this->importer->importAnnotation(Annotation::fromJson($annotation));
        if (!isset($item->{'@id'})) {
            return $this->formAction($form->getData(), 'Something went wrong importing annotation');
        }

        return $this->redirect()->toRoute('admin/id', ['controller' => 'item', 'id' => $item->{'o:id'}]);
    }
}
