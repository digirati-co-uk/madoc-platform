<?php

namespace PublicUser\Subscriber;

use Doctrine\DBAL\Connection;
use Elucidate\Event\AnnotationLifecycleEvent;
use Exception;
use Omeka\Api\Manager;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Zend\Authentication\AuthenticationServiceInterface;
use Zend\Uri\Uri;

class AnnotationStatsSubscriber implements EventSubscriberInterface
{
    /**
     * The motivation for when the user intends to associate a "complete" state with the Target.
     */
    const CROWDS_MOTIVATION_COMPLETED = 'https://digirati.com/ns/crowds#completed';

    /**
     * The motivation for when the user intends to push this annotation as a draft to be edited later.
     */
    const CROWDS_MOTIVATION_DRAFTING = 'http://www.digirati.com/ns/crowds#drafting';

    /**
     * The motivation used when the user intends to save the target entity as a bookmark.
     */
    const OA_MOTIVATION_BOOKMARKING = 'bookmarking';

    /**
     * A list of OpenAnnotation motivations that should be ignored.
     */
    const OA_MOTIVATION_IGNORE = [
        'moderation',
        self::CROWDS_MOTIVATION_COMPLETED,
    ];

    /**
     * SQL query that will insert/update statistics for a given user and canvas.
     *
     * @var string
     */
    private static $STATS_SQL = <<<SQL
INSERT INTO user_canvas_mapping 
  (canvas_mapping_id, user_id, bookmarked, complete_count, incomplete_count) 
    VALUES 
  (:canvasId, :uid, :bookmarked, :complete, :incomplete)
ON DUPLICATE KEY UPDATE
  bookmarked = VALUES(bookmarked),
  complete_count = complete_count + VALUES(complete_count),
incomplete_count = incomplete_count + VALUES(incomplete_count);
SQL;

    public static function getSubscribedEvents()
    {
        return [
            AnnotationLifecycleEvent::PRE_CREATE => ['handleAnnotationCreatedEvent'],
            AnnotationLifecycleEvent::PRE_DELETE => ['handleAnnotationDeletedEvent'],
        ];
    }

    private static function getValue($data)
    {
        return $data[0]['@value'] ?? $data['@value'] ?? $data['@id'] ?? $data;
    }

    /**
     * @var Connection
     */
    private $db;

    /**
     * @var Manager
     */
    private $api;

    /**
     * @var AuthenticationServiceInterface
     */
    private $auth;

    public function __construct(Manager $api, Connection $db, AuthenticationServiceInterface $auth)
    {
        $this->api = $api;
        $this->db = $db;
        $this->auth = $auth;
    }

    /**
     * Handle {@code create}/{@code update} events and set the {@code completed} flag to true on the given Target.
     *
     * @param AnnotationLifecycleEvent $event
     */
    public function handleAnnotationCreatedEvent(AnnotationLifecycleEvent $event)
    {
        $this->handleAnnotationLifecycleEvent($event, false);
    }

    /**
     * Handle {@code delete} events and set the {@code completed} flag to {@code false} for the given target.
     */
    public function handleAnnotationDeletedEvent(AnnotationLifecycleEvent $event)
    {
        $this->handleAnnotationLifecycleEvent($event, true);
    }

    public function handleAnnotationLifecycleEvent(AnnotationLifecycleEvent $event, bool $isDelete)
    {
        $annotation = $event->getLatestAnnotation();

        // We need to use -> to access a property backed by metadata,
        // since `Annotation` is a class that implements both ArrayAccess
        // and the __get magic method.  This is completely insane.

        $motivation = self::getValue($annotation->motivation);
        $target = self::getValue($annotation['target']);
        if (is_array($target) && isset($target['source'])) {
            $target = $target['source'];
        }

        if (!$target) {
            return;
        }

        // Remove temporal or spatial selectors from the target URI if present.
        $targetUri = new Uri($target);
        $targetUri->setFragment(null);

        $canvasMappingSearch = $this->api->search(
            'canvas_mappings',
            [
                'canvas_url' => $targetUri->toString(),
            ]
        );

        $canvasMappings = $canvasMappingSearch->getContent();
        if (!$canvasMappings) {
            return;
        }

        // Only one of these conditions will evaluate to true at any given time,
        // however, for the sake of brevity in the SQL query we keep track of the 3 of them.

        $bookmarked = false;
        $complete = false;
        $incomplete = false;

        if (self::OA_MOTIVATION_BOOKMARKING === $motivation) {
            $bookmarked = true;
        } elseif (self::CROWDS_MOTIVATION_DRAFTING === $motivation) {
            $incomplete = true;
        } elseif (!in_array($motivation, self::OA_MOTIVATION_IGNORE, true)) {
            $complete = true;
        }

        $canvasMapping = array_pop($canvasMappings);
        $canvasMappingId = $canvasMapping->id();
        $identity = $this->auth->getIdentity();
        $updateValue = $isDelete ? -1 : 1;

        // We need to atomically execute the update here.  Fetching the number, incrementing it,
        // and sending out a new update would result in a data race.

        try {
            $this->db->beginTransaction();
            $this->db->executeUpdate(self::$STATS_SQL, [
                'bookmarked' => $bookmarked ? $updateValue : 0,
                'complete' => $complete ? $updateValue : 0,
                'incomplete' => $incomplete ? $updateValue : 0,
                'canvasId' => $canvasMappingId,
                'uid' => $identity->getId(),
            ]);
            $this->db->commit();
        } catch (Exception $ex) {
            $this->db->rollBack();
        }
    }
}
