<?php

namespace i18n\Event;

use BabDev\Transifex\Translations;
use i18n\Loader\TransifexResourceMessageLoader;
use Zend\EventManager\AbstractListenerAggregate;
use Zend\EventManager\Event;
use Zend\EventManager\EventManagerInterface;
use Zend\I18n\Translator\Translator;
use Zend\Log\LoggerInterface;

class TranslationMissingListener extends AbstractListenerAggregate
{
    /**
     * @var LoggerInterface
     */
    private $logger;

    /**
     * @var Translations
     */
    private $translations;

    public function __construct(LoggerInterface $logger, Translations $translations)
    {
        $this->logger = $logger;
        $this->translations = $translations;
    }

    public function loadMessages(Event $event)
    {
        $messageKey = $event->getParam('message');
        $messages = $this->loadMessagesForResource($event);

        return $messages[$messageKey] ?? null;
    }

    public function loadMessagesForResource(Event $event)
    {
        $textDomain = $event->getParam('text_domain');
        $locale = $event->getParam('locale');

        if ('default' === $textDomain) {
            return null;
        }

        $loader = new TransifexResourceMessageLoader($this->logger, $this->translations);
        $messages = $loader->load($locale, $textDomain);

        return $messages;
    }

    /**
     * Attach one or more listeners.
     *
     * Implementors may add an optional $priority argument; the EventManager
     * implementation will pass this to the aggregate.
     *
     * @param EventManagerInterface $events
     * @param int                   $priority
     */
    public function attach(EventManagerInterface $events, $priority = 1)
    {
        $this->listeners[] = $events->attach(
            Translator::EVENT_NO_MESSAGES_LOADED,
            [
                $this, 'loadMessagesForResource',
            ]
        );
    }
}
