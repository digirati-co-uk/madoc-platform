<?php

namespace Bookmarking\Event;

use Symfony\Component\EventDispatcher\GenericEvent;

class BookmarkEvent extends GenericEvent
{
    public function setBookmarkLink(string $link)
    {
        $this->setArgument('bookmark', $link);
    }

    public function wasHandled()
    {
        return $this->hasArgument('bookmark');
    }
}
