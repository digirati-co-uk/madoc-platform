<?php

namespace Comments\Plugin;

use DateTimeImmutable;

class StaticComment implements Comment
{
    private $author;
    private $subject;
    private $body;
    private $datePosted;

    public static function fromString(string $comment, DateTimeImmutable $datePosted = null)
    {
        return new static(
            $comment,
            null,
            null,
            $datePosted
        );
    }

    public function __construct(string $body, Participator $author = null, Subject $subject = null, DateTimeImmutable $datePosted = null)
    {
        $this->author = $author;
        $this->subject = $subject;
        $this->body = $body;
        $this->datePosted = $datePosted ? $datePosted : new DateTimeImmutable();
    }

    public function getAuthor(): Participator
    {
        return $this->author;
    }

    public function getSubject(): Subject
    {
        return $this->subject;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getDatePosted(): DateTimeImmutable
    {
        return $this->datePosted;
    }

    public function setAuthor(Participator $author): Comment
    {
        $this->author = $author;

        return $this;
    }

    public function setSubject(Subject $subject): Comment
    {
        $this->subject = $subject;

        return $this;
    }
}
