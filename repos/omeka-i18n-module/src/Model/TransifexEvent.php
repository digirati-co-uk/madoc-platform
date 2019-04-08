<?php

namespace i18n\Model;

use InvalidArgumentException;

final class TransifexEvent
{
    const TRANSLATION_COMPLETED = 'translation_completed';
    const REVIEW_COMPLETED = 'review_completed';
    const FILLUP_COMPLETED = 'fillup_completed';

    const TYPES = [self::TRANSLATION_COMPLETED, self::REVIEW_COMPLETED, self::FILLUP_COMPLETED];

    /**
     * The project name this event occurred for.
     *
     * @var string
     */
    private $project;

    /**
     * The resource name this event occurred for.
     *
     * @var string
     */
    private $resource;

    /**
     * The ISO 639-1 language code representing the language that this event occurred for.
     *
     * @var string
     */
    private $languageCode;

    /**
     * The completion percentage of all translations/reviews in the given {@code resource}.
     *
     * @var int
     */
    private $completionPercentage;

    /**
     * Internal name of Transifex event codes.
     *
     * @var string
     */
    private $type;

    /**
     * Create a new {@link TransifexEvent} from a dictionary.
     *
     * @param array $data a dictionary of event keys to values
     *
     * @return TransifexEvent a new {@link TransifexEvent} using values from {@code data}
     */
    public static function from(array $data)
    {
        foreach (['project', 'resource', 'languageCode', 'completionPercentage', 'type'] as $field) {
            if (!isset($data[$field]) || '' === $data[$field]) {
                throw new InvalidArgumentException("Missing value for field '$field'");
            }
        }

        return new self(
            $data['project'],
            $data['resource'],
            $data['languageCode'],
            (int) $data['completionPercentage'],
            $data['type']
        );
    }

    /**
     * Create a new TransifexEvent.
     *
     * @param string $project
     * @param string $resource
     * @param string $languageCode
     * @param int    $completionPercentage
     * @param string $type                 the unique type id of this event.  Must be one of: {@link self#TYPES}.
     */
    public function __construct(
        string $project,
        string $resource,
        string $languageCode,
        int $completionPercentage,
        string $type
    ) {
        if (!in_array($type, self::TYPES, true)) {
            throw new InvalidArgumentException(
                sprintf(
                    "Unknown event type, found '%s', expected one of: %s",
                    $type,
                    implode(', ', self::TYPES)
                )
            );
        }

        $this->project = $project;
        $this->resource = $resource;
        $this->languageCode = $languageCode;
        $this->completionPercentage = $completionPercentage;
        $this->type = $type;
    }

    /**
     * @return string
     */
    public function getProject(): string
    {
        return $this->project;
    }

    /**
     * @return string
     */
    public function getResource(): string
    {
        return $this->resource;
    }

    /**
     * @return string
     */
    public function getLanguageCode(): string
    {
        return $this->languageCode;
    }

    /**
     * @return int
     */
    public function getCompletionPercentage(): int
    {
        return $this->completionPercentage;
    }

    /**
     * @return string
     */
    public function getType(): string
    {
        return $this->type;
    }
}
