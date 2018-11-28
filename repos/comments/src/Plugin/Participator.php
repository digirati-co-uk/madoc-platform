<?php

namespace Comments\Plugin;

interface Participator
{
    public function getId(): string;

    public function getDisplayName(): string;

    public function getLink(): string;

    public function hasLink(): bool;
}
