<?php

namespace MadocBridge\Controller;

use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Zend\View\Model\ViewModel;

class TemplateController extends AbstractPsr7ActionController
{
    public function viewAction()
    {
        // Any additional data?
        return new ViewModel();
    }
}
