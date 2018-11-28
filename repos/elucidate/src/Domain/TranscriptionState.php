<?php

namespace ElucidateModule\Domain;

use Doctrine\Common\Collections\ArrayCollection;

final class TranscriptionState
{
    /**
     * @var ArrayCollection
     */
    private $transcriptions;

    public function __construct(ArrayCollection $transcriptions)
    {
        $transcriptionsValues = $transcriptions->getValues();

        // Sort by date, descending
        usort($transcriptionsValues, function (Transcription $a, Transcription $b) {
            return $b->getCreatedAt() <=> $a->getCreatedAt();
        });

        $this->transcriptions = new ArrayCollection($transcriptionsValues);
    }

    public function getDisplayItem()
    {
        return $this->transcriptions->filter(
            function (Transcription $transcription) {
                return $transcription->isApproved();
            }
        )->first() ?: null;
    }

    /**
     * Get the most recent editable item for the annotation editor identified by {@code creator}.
     *
     * @param $creator
     *
     * @return Transcription|null
     */
    public function getEditableItem($creator)
    {
        $item = $this->transcriptions
            ->filter(
                function (Transcription $transcription) use ($creator) {
                    return $transcription->isCreatedBy($creator) && !$transcription->isApproved();
                }
            )
            ->first();

        if (false === $item) {
            $item = $this->getDisplayItem();
        }

        return $item ?: null;
    }
}
