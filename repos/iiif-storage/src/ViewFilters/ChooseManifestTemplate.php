<?php

namespace IIIFStorage\ViewFilters;


use IIIFStorage\Utility\PropertyIdSaturator;
use Zend\View\Model\ModelInterface;
use Zend\View\Renderer\PhpRenderer;

class ChooseManifestTemplate implements ViewFilterInterface
{
    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    public function __construct(PropertyIdSaturator $saturator)
    {
        $this->saturator = $saturator;
    }

    const JS_SNIPPET = <<<JS
    $(function() {
        $('[name="o:resource_template[o:id]"]').val('%s');
        $('#resource-template-select').trigger('chosen:updated');
    });
JS;


    public function __invoke(PhpRenderer $renderer, ModelInterface $vm)
    {
        $renderer->inlineScript()->appendScript(static::JS_SNIPPET);
        if (isset($_GET['resource_template'])) {
            $renderer->headScript()->appendScript(
                sprintf(static::JS_SNIPPET, $this->saturator->getResourceTemplateByName($_GET['resource_template'])->id())
            );
        }
    }

    public function getEvent(): string
    {
        return 'view.add.before';
    }

    public function getEntity(): array
    {
        return ['Omeka\Controller\Admin\ItemSet', 'Omeka\Controller\Admin\Item'];
    }
}
