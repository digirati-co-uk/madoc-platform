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
    /**
     * @var \Zend\Http\Request
     */
    private $request;

    public function __construct(
        Logger $logger,
        PropertyIdSaturator $saturator,
        array $aggregations = [],
        Messenger $messenger,
    \Zend\Http\Request $request
    ) {
        $this->logger = $logger;
        $this->saturator = $saturator;
        $this->aggregations = $aggregations;
        $this->messenger = $messenger;
        $this->request = $request;
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

    /**
     * @param Event $event
     * @throws \Throwable
     */
    public function handleImport(Event $event)
    {
        $this->logger->notice(implode(' : ', array_keys($event->getParams())));
        /** @var Request $request */
        $request = $event->getParam('request');
        // Create wrapper object
        $itemOrItemSet = ItemRequest::fromPost($request->getContent());
        // Add missing data.
        $this->saturator->addResourceIds($itemOrItemSet);
        // Set some metadata
        $metadata = [
          'base_url' => getenv('OMEKA__MAIN_SITE_DOMAIN'),
        ];
        try {
            // Parse the starting resource.
            foreach ($this->aggregations as $step) {
                if ($step->supports($itemOrItemSet)) {
                    // Run these sequentially for now, will become relevant when batching.
                    $step->parse($itemOrItemSet, $metadata);
                    $step->prepare();
                    $step->mutate($itemOrItemSet);
                }
            }
        } catch (\Throwable $e) {
            // Reset step, and any queues it might hold.
            $step->reset();
            // Log first
            if ($e instanceof ValidationException) {
                error_log((string)$e);
                $this->messenger->addError($e->getMessage());
                $event->stopPropagation();
            }
            // then rethrow
            throw $e;
        }
        // Add property ids, as a shim.
        $this->saturator->addPropertyIds($itemOrItemSet);
        // Export and add our mutated object.
        $request->setContent($itemOrItemSet->export());
    }
}
