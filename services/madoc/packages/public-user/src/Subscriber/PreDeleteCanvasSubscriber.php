<?php


namespace PublicUser\Subscriber;

use Doctrine\DBAL\Connection;
use Omeka\Api\Adapter\ItemAdapter;
use Omeka\Api\Request;
use Throwable;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\Log\Logger;

class PreDeleteCanvasSubscriber
{

    /**
     * @var Logger
     */
    private $logger;
    /**
     * @var Connection
     */
    private $db;

    private static $SELECT_SQL = <<<SQL
    SELECT * FROM user_canvas_mapping WHERE canvas_mapping_id=:canvasId
SQL;



    /**
     * SQL query that will insert/update statistics for a given user and canvas.
     *
     * @var string
     */
    private static $DELETE_SQL = <<<SQL
    DELETE FROM user_canvas_mapping WHERE canvas_mapping_id=:canvasId
SQL;

    public function __construct(
        Logger $logger,
        Connection $db
    )
    {
        $this->logger = $logger;
        $this->db = $db;
    }

    public function attach(SharedEventManagerInterface $events)
    {

        $events->attach(
            ItemAdapter::class,
            'api.delete.pre',
            [$this, 'handleDelete'],
            -1000
        );
    }

    /**
     * @param Event $event
     * @throws Throwable
     */
    public function handleDelete(Event $event)
    {
        $this->logger->notice(implode(' : ', array_keys($event->getParams())));
        /** @var Request $request */
        $request = $event->getParam('request');
        $id = $request->getId();

        $results = $this->db->executeQuery(self::$SELECT_SQL, [
            'canvasId' => $id,
        ]);

        if ($results->rowCount()) {
            try {
                $this->db->beginTransaction();
                $update = $this->db->executeUpdate(self::$DELETE_SQL, [
                    'canvasId' => $id
                ]);

                $this->logger->log(Logger::INFO, 'Removed user canvases', [
                    'canvasId' => $id,
                    'result' => $update,
                ]);

                $this->db->commit();
            } catch (Throwable $ex) {
                $this->logger->log(Logger::WARN, 'Could not remove user mapping', [
                    'canvasId' => $id,
                    'error' => (string)$ex,
                ]);
                $this->db->rollBack();
            }
        }

    }

}
