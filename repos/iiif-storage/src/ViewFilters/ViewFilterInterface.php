<?php

namespace IIIFStorage\ViewFilters;

use Zend\View\Model\ModelInterface;
use Zend\View\Renderer\PhpRenderer;

interface ViewFilterInterface
{
    public function __invoke(PhpRenderer $renderer, ModelInterface $vm);

    public function getEvent(): string;

    public function getEntity(): array;
}
