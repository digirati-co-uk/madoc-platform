<?php

namespace IIIFStorage\Model;


interface ResourceRepresentation
{
    public function getId(): string;
    public function getOmekaId(): string;
    public function getJson(): array;
}
