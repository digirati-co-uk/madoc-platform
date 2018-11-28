<?php

namespace Comments\Plugin;

class FlatCommentList implements CommentList
{
    private $comments;

    public function __construct(Comment ...$comments)
    {
        $this->comments = $comments;
    }

    public function getComments(int $limit = null, int $offset = 0): array
    {
        return array_slice($this->comments, $offset, $limit);
    }

    public function addComment(Comment $item)
    {
        $this->comments[] = $item;

        return $this;
    }
}
