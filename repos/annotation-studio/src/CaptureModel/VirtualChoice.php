<?php

namespace AnnotationStudio\CaptureModel;

class VirtualChoice
{
    public function __construct(string $id, string $title, string $description, array $children = [])
    {
        $this->{'@id'} = $id;
        $this->{'crowds:derivedAnnoCombine'} = 'False';
        $this->{'crowds:derivedAnnoExternalize'} = 'False';
        $this->{'crowds:derivedAnnoHumanReadable'} = 'False';
        $this->{'crowds:derivedAnnoSerialize'} = 'False';
        $this->{'crowds:uiChoice'} = 'True';
        $this->{'crowds:uiMultiple'} = 'True';
        $this->{'dcterms:description'} = $description;
        $this->{'dcterms:title'} = $title;
        $this->{'rdfs:label'} = $title;
        $this->{'o:id'} = 1337;
        $this->{'dcterms:hasPart'} = $children;
    }
}
