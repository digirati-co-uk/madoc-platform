<?php

namespace i18n\Resource\Writer;

use i18n\Resource\TranslatableResourceException;

class JsonResourceWriter implements TranslatableResourceWriter
{
    public function write(array $messages): string
    {
        array_walk(
            $messages,
            function (&$key, $val) {
                $key = addcslashes($key, '.');
            }
        );

        $content = json_encode($messages);
        if (false === $content) {
            throw new TranslatableResourceException(
                sprintf('Unable to encode messages to json: %s', json_last_error_msg())
            );
        }

        return $content;
    }
}
