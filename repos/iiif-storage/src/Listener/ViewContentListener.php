<?php

namespace IIIFStorage\Listener;


use IIIFStorage\FieldFilters\FieldFilterInterface;
use IIIFStorage\Media\MetadataRenderer;
use IIIFStorage\Utility\ApiRouter;
use IIIFStorage\ViewFilters\ViewFilterInterface;
use Omeka\Api\Representation\AbstractResourceEntityRepresentation;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Log\Logger;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;

class ViewContentListener
{
    /**
     * @var ViewFilterInterface[]
     */
    private $viewFilters;

    /**
     * @var FieldFilterInterface[]
     */
    private $fieldFilters;

    /**
     * @var Logger
     */
    private $logger;
    /**
     * @var ApiRouter
     */
    private $router;
    /**
     * @var MetadataRenderer
     */
    private $metadataRenderer;

    public function __construct(
        Logger $logger,
        ApiRouter $router,
        MetadataRenderer $metadataRenderer,
        array $viewFilters = [],
        array $fieldFilters = []
    ) {
        $this->logger = $logger;
        $this->router = $router;
        $this->viewFilters = $viewFilters;
        $this->fieldFilters = $fieldFilters;
        $this->metadataRenderer = $metadataRenderer;
    }

    public function attach(SharedEventManagerInterface $events)
    {
        $events->attach('*', 'view.show.section_nav', [$this, 'addEditPageLinks']);
        foreach ($this->fieldFilters as $fieldFilter) {
            $events->attach(
                $fieldFilter->getEntity(),
                'rep.resource.display_values',
                function (Event $e) use ($fieldFilter) {
                    /** @var AbstractResourceEntityRepresentation $target */
                    $target = $e->getTarget();
                    $newValues = $fieldFilter($target, $e->getParam('values'));
                    if ($newValues !== null) {
                        $e->setParam('values', $newValues);
                    }
                }
            );
        }

        foreach ($this->viewFilters as $viewEvent) {
            foreach ($viewEvent->getEntity() as $entity) {
                $events->attach(
                    $entity,
                    $viewEvent->getEvent(),
                    function (Event $e) use ($viewEvent) {
                        /** @var PhpRenderer $renderer */
                        $renderer = $e->getTarget();
                        /** @var ViewModel $viewModel */
                        $viewModel = $renderer->viewModel()->getCurrent();
                        // Call our filter.
                        $viewEvent($renderer, $viewModel);
                    }
                );
            }
        }
    }

    public function addEditPageLinks(Event $e)
    {
        $itemSet = $e->getParam('resource');
        if ($itemSet instanceof ItemSetRepresentation || $itemSet instanceof ItemRepresentation) {
            $resourceTemplate = $itemSet->resourceTemplate();
            if (!$resourceTemplate || !$itemSet->resourceClass()) {
                return null;
            }

            $resourceClass = $itemSet->resourceClass()->term();
            if ($resourceClass === 'sc:Collection') {
                $url = $this->router->collection($itemSet->id());
                echo '<p>This appears to be a IIIF Collection, you can view the JSON representation of this resource &nbsp;<a class="button"  target="_blank" href="' . $url . '">view resource</a></p>';
                return $this->renderMetadata($itemSet);
            }
            if ($resourceClass === 'sc:Manifest') {
                $url = $this->router->manifest($itemSet->id());

                $sorty = $itemSet->value('dcterms:replaces') ? '' : '
                    <a class="button"  target="_blank" href="/sorting-room/classify.html?manifest=' . $url . '">
                        Open in Sorty
                    </a>';

                echo '
                    <p>
                        This appears to be a IIIF Manifest, you can view the JSON representation of this resource &nbsp;
                        <a class="button"  target="_blank" href="' . $url . '">
                            View resource
                        </a>
                        ' . $sorty . '
                    </p>';

                return $this->renderMetadata($itemSet);
            }
            if ($resourceClass === 'sc:Canvas') {
                $url = $this->router->canvas($itemSet->id());
                echo '<p>This appears to be a IIIF Canvas, you can view the JSON representation of this resource &nbsp;<a class="button" target="_blank" href="' . $url . '">view resource</a></p>';
                return $this->renderMetadata($itemSet);
            }
        }
    }

    public function renderMetadata($itemSet)
    {
        try {
            echo $this->metadataRenderer->renderItem($itemSet, ['show_title' => false]);
        } catch (\Throwable $e) {
            error_log((string) $e);
        }

        return null;
    }

}
