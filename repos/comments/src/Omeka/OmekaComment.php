<?php

namespace Comments\Omeka;

use Comments\Plugin\Comment;
use Comments\Plugin\OmekaUser;
use Comments\Plugin\Participator;
use Comments\Plugin\Subject;
use DateTimeImmutable;

class OmekaComment implements Comment
{
    private $author;
    private $body;
    private $subject;
    private $posted;

    public function __construct(
        OmekaUser $author,
        string $body,
        Subject $subject,
        DateTimeImmutable $posted
    ) {
        $this->author = $author;
        $this->body = $body;
        $this->subject = $subject;
        $this->posted = $posted;
    }

    public function getBody(): string
    {
        return $this->body;
    }

    public function getDatePosted(): DateTimeImmutable
    {
        return $this->posted;
    }

    public function getAuthor(): Participator
    {
        return $this->author;
    }

    public function getSubject(): Subject
    {
        return $this->subject;
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
