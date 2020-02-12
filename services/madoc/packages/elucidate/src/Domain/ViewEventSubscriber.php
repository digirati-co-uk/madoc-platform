<?php

namespace ElucidateModule\Domain;

use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;

class ViewEventSubscriber
{
    private $events = [];

    public function addView($instance, $event)
    {
        array_push($this->events, [
           'instance' => $instance,
            'event' => $event,
        ]);

        return $instance;
    }

    public function attach(SharedEventManagerInterface $events, $priority = 100)
    {
        foreach ($this->events as $meta) {
            $events->attach(
                '*',
                $meta['event'],
                function (Event $event) use ($meta) {
                    $viewModel = $event->getParam('viewModel');
                    if (method_exists($meta['instance'], 'render')) {
                        $meta['instance']->render($viewModel, $event);
                    }
                },
                $priority
            );
        }
    }
}
