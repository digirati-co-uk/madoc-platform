<?php

namespace Comments\Plugin;

interface CommentList
{
    public function getComments(int $limit = null, int $offset = 0): array;

    public function addComment(Comment $item);
}
