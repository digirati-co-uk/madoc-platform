<?php

namespace i18n\Resource;

interface TranslatableResource
{
    /**
     * Return a generator that yields mappings of translation keys to
     * messages for the given {@code languageCode}.
     *
     * @return \Generator
     */
    public function getMessages();

    /**
     * Get the unique name of this resource.
     *
     * @return TranslatableResourceIdentifier
     */
    public function getIdentifier();
}
