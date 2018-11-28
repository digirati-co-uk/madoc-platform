<?php

namespace ElucidateModule\Service;

use ElucidateModule\Domain\Topics\TopicType;

final class TopicFinder
{
    /**
     * @var TacsiClient
     */
    private $client;

    public function __construct(TacsiClient $client)
    {
        $this->client = $client;
    }

    public function findByTypes(TopicType ...$types)
    {
        $results = [];

        foreach ($types as $type) {
            $results[$type->getLabel()] = $this->findByType($type);
        }

        return $results;
    }

    public function findByType(TopicType $type)
    {
        return $this->client->search([
            'classes' => $type->getClasses(),
        ]);
    }
}
