<?php

namespace IIIFStorage\Listener;

use IIIFStorage\Aggregate\AggregateInterface;
use Digirati\OmekaShared\Model\ItemRequest;
use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Omeka\Api\Adapter\ItemAdapter;
use Omeka\Api\Adapter\ItemSetAdapter;
use Omeka\Api\Exception\ValidationException;
use Omeka\Api\Request;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Log\Logger;
use Omeka\Mvc\Controller\Plugin\Messenger;

class ImportContentListener
{
    /**
     * @var Logger
     */
    private $logger;

    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    /**
     * @var AggregateInterface[]
     */
    private $aggregations;
    /**
     * @var Messenger
     */
    private $messenger;

    public function __construct(
        Logger $logger,
        PropertyIdSaturator $saturator,
        array $aggregations = [],
        Messenger $messenger
    ) {
        $this->logger = $logger;
        $this->saturator = $saturator;
        $this->aggregations = $aggregations;
        $this->messenger = $messenger;
    }

    public function attach(SharedEventManagerInterface $events)
    {
        $events->attach(
            ItemSetAdapter::class,
            'api.create.pre',
            [$this, 'handleImport'],
            -1000
        );

        $events->attach(
            ItemAdapter::class,
            'api.create.pre',
            [$this, 'handleImport'],
            -1000
        );
    }

    public function handleImport(Event $event)
    {
        $this->logger->notice(implode(' : ', array_keys($event->getParams())));
        /** @var Request $request */
        $request = $event->getParam('request');
        // Create wrapper object
        $itemOrItemSet = ItemRequest::fromPost($request->getContent());
        // Add missing data.
        $this->saturator->addResourceIds($itemOrItemSet);
        try {
            // Parse the starting resource.
            foreach ($this->aggregations as $step) {
                if ($step->supports($itemOrItemSet)) {
                    // Run these sequentially for now, will become relevant when batching.
                    $step->parse($itemOrItemSet);
                    $step->prepare();
                    $step->mutate($itemOrItemSet);
                }
            }
        } catch (\Throwable $e) {
            if ($e instanceof ValidationException) {
                error_log((string)$e);
                $this->messenger->addError($e->getMessage());
                $event->stopPropagation();
            }
            throw $e;
        }
        // Add property ids, as a shim.
        $this->saturator->addPropertyIds($itemOrItemSet);
        // Export and add our mutated object.
        $request->setContent($itemOrItemSet->export());
    }
}
