<?php

namespace i18n\Admin\ReportOptions;


interface ReportOption
{
    public function getLabel(string $verb = 'Report'): string;

    public function getLink(): string;
}
