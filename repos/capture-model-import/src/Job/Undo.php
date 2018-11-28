<?php

namespace CaptureModelImport\Job;

use Omeka\Job\AbstractJob;

class Undo extends AbstractJob
{
    public function perform()
    {
        $jobId = $this->getArg('jobId');
        $api = $this->getServiceLocator()->get('Omeka\ApiManager');
        $response = $api->search('csvimport_entities', ['job_id' => $jobId]);
        $csvEntities = $response->getContent();
        if ($csvEntities) {
            foreach ($csvEntities as $csvEntity) {
                $api->delete('csvimport_entities', $csvEntity->id());
                $api->delete($csvEntity->resourceType(), $csvEntity->entityId());
            }
        }
    }
}
