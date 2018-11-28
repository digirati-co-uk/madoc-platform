<?php

namespace ElucidateModule\Domain;

use DateTime;

final class Transcription
{
    /**
     * We need to attempt to parse several date formats, due to a lack of consistency between services.
     *
     * @var string[]
     */
    private static $dateFormats = [
        DateTime::ISO8601,
        'Y-m-d\TH:i:s.uP',
    ];

    /**
     * @var mixed
     */
    private $annotation;

    /**
     * @var mixed
     */
    private $creator;

    /**
     * @var string
     */
    private $body;

    /**
     * @var bool
     */
    private $approved;

    /**
     * @var DateTime
     */
    private $createdAt;

    public function __construct($annotation, $creator, string $body, bool $approved, DateTime $createdAt)
    {
        $this->annotation = $annotation;
        $this->creator = $creator;
        $this->body = $body;
        $this->approved = $approved;
        $this->createdAt = $createdAt;
    }

    /**
     * Check if this {@code Transcription} has been approved.
     *
     * @return bool
     */
    public function isApproved(): bool
    {
        return $this->approved;
    }

    /**
     * Check if this {@code Transcription} was created by a user with the given {@code email} address.
     *
     * @param string $email
     *
     * @return bool
     */
    public function isCreatedBy(string $email): bool
    {
        //@todo - dont re-compute sha1 on every comparison
        return $this->creator['email_sha1'] === sha1($email);
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getCreatedAt(): DateTime
    {
        return $this->createdAt;
    }

    public function getCreator()
    {
        return $this->creator;
    }

    public function getId()
    {
        return $this->annotation['id'] ?? $this->annotation['@id'];
    }

    public static function fromAnnotation($annotation)
    {
        $date = null;

        foreach (self::$dateFormats as $dateFormat) {
            $date = DateTime::createFromFormat($dateFormat, $annotation['created']);

            if (false !== $date) {
                break;
            }
        }

        return new Transcription(
            $annotation,
            $annotation['creator'],
            $annotation['body']['value'] ?? '',
            false !== strstr($annotation['generator'] ?? '', '/moderated/'),
            $date
        );
    }
}
