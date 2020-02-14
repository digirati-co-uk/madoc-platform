<?php

namespace PublicUser\Subscriber;

use Digirati\OmekaShared\Utility\PropertyIdSaturator;
use Doctrine\DBAL\Connection;
use IIIFStorage\Model\ManifestRepresentation;
use Throwable;
use Zend\EventManager\Event;
use Zend\EventManager\SharedEventManagerInterface;
use Zend\View\Model\ViewModel;

class ManifestStatsSubscriber
{
    /**
     * @var Connection
     */
    private $db;

    private static $GET_STATS = <<<SQL
SELECT
  V2.value_resource_id as canvas_id,
  UC.bookmarked as bookmarks,
  UC.incomplete_count as incomplete_count,
  UC.complete_count as complete_count
FROM value V2
  LEFT JOIN value V1 on V1.resource_id = V2.value_resource_id
  LEFT JOIN user_canvas_mapping UC on UC.canvas_mapping_id = V2.value_resource_id
WHERE V2.property_id = :hasCanvases
  AND V1.property_id = 10
  AND V2.resource_id = :manifestId;
SQL;
    /**
     * @var PropertyIdSaturator
     */
    private $saturator;

    public function __construct(
        Connection $db,
        PropertyIdSaturator $saturator
    )
    {
        $this->db = $db;
        $this->saturator = $saturator;
    }

    public function attach(SharedEventManagerInterface $events, $priority = 100)
    {
        $events->attach('*', 'iiif.manifest.view', [$this, 'viewManifest']);
    }

    public function viewManifest(Event $event) {
        try {
            /** @var ViewModel $viewModel */
            $viewModel = $event->getParam('viewModel');

            /** @var ManifestRepresentation $manifest */
            $manifest = $viewModel->getVariable('resource');

            $manifestId = $manifest->getOmekaId();
            if (!$manifestId) {
                return;
            }
            $result = $this->db->executeQuery(self::$GET_STATS, [
                'hasCanvases' => $this->saturator->loadPropertyId('sc:hasCanvases'),
                'manifestId' => $manifestId
            ]);

            $map = [];
            foreach ($result->fetchAll() as $row) {
                $map[(string)$row['canvas_id']] = $row;
            }

            $model = $manifest->getManifest();
            foreach ($model->getCanvases() as $canvas) {
                $source = $canvas->getSource();
                $omekaId = $source['o:id'] ?? null;

                if ($omekaId && $map[(string)$omekaId] ?? null) {
                    $stats = $map[(string)$omekaId];

                    $incomplete = intval($stats['incomplete_count'], 10) ?? 0;
                    $complete = intval($stats['complete_count'], 10) ?? 0;
                    $bookmarks = intval($stats['bookmarks'], 10) ?? 0;

                    $canvas->addMetaData([
                        'edited' => $incomplete,
                        // Incomplete count does not reset when marking as complete.
                        'completed' => $complete > 0 /*&& $incomplete === 0*/,
                        'totalBookmarks' => $bookmarks,
                    ]);
                }
            }
        } catch (Throwable $exception) {
            error_log($exception->getMessage());
        }
    }
}
