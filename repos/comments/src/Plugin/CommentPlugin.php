<?php

namespace Comments\Plugin;

interface CommentPlugin
{
    public function getCurrentUser(): Consumer;

    public function getSubjectFromParameters(...$parameters): Subject;

    public function getAllComments(Subject $subject): CommentList;

    public function createCommentFromPost(...$parameters): Comment;

    public function canSendComment(Consumer $consumer, Subject $subject = null): bool;

    public function sendComment(Comment $comment, CommentList $list): CommentList;

    public function getCommentForm(): string;
}
