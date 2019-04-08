<?php

namespace i18n\Resource\Writer;

use Traversable;

interface TranslatableResourceWriter
{
    /**
     * Write the translations in {@code messages} out to a string and return it in the format this
     * {@link TranslatableResourceWriter} targets.
     *
     * @param Traversable $messages a mapping of translation ID's to their messages
     *
     * @return string
     */
    public function write(array $messages): string;
}
