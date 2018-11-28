<?php

namespace Comments\Plugin;

interface Subject
{
    public function getId(): string;

    public function getLink(): string;

    public function hasLink(): bool;

    public function getLabel(): string;
}
