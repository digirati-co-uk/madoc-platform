<?php

namespace IIIFStorage\Aggregate;

use Digirati\OmekaShared\Model\ItemRequest;

interface AggregateInterface
{
    public function mutate(ItemRequest $input);
    public function supports(ItemRequest $input);
    public function parse(ItemRequest $input);
    public function prepare();
}
