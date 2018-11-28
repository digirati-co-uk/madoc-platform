<?php

namespace Comments\Plugin;

use DateTimeImmutable;

interface Comment
{
    public function getAuthor(): Participator;

    public function setAuthor(Participator $author): Comment;

    public function getSubject(): Subject;

    public function setSubject(Subject $subject): Comment;

    public function getBody(): string;

    public function getDatePosted(): DateTimeImmutable;
}
