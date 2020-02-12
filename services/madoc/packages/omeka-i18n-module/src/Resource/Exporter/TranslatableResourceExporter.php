<?php

namespace i18n\Resource\Exporter;

use i18n\Resource\TranslatableResource;
use i18n\Resource\Writer\TranslatableResourceWriter;

interface TranslatableResourceExporter
{
    public function export(string $language, TranslatableResource $resource, TranslatableResourceWriter $writer);
}
