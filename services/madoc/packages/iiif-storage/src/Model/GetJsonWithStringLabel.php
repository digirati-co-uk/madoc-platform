<?php
namespace IIIFStorage\Model;

use Digirati\OmekaShared\Utility\OmekaValue;

trait GetJsonWithStringLabel {

    public function getJsonWithStringLabel(): array
    {
        $label = $this->getJson()['label'] ?? null;
        if ($label && !is_string($label)) {
            $foundLabel = null;
            foreach ($label as $singleLabel) {
                if (OmekaValue::langMatches($singleLabel['@language'] ?? null, $this->getLang())) {
                    $foundLabel = $singleLabel['@value'] ?? '';
                }
            }
            return array_merge([], $this->getJson(), [
                'label' => $foundLabel ?? $label[0]['@value'] ?? $label['@value'] ?? '',
            ]);
        }
        return $this->getJson();
    }

    abstract public function getJson(): array;

    abstract public function getLang(): string;
}
