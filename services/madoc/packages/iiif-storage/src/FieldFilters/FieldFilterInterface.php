<?php
namespace IIIFStorage\FieldFilters;

use Omeka\Api\Representation\AbstractResourceEntityRepresentation;

interface FieldFilterInterface
{
    public function __invoke(AbstractResourceEntityRepresentation $entity, array $data): ?array;

    public function getEntity(): string;
}
