<?php

namespace Comments\Plugin;

use Comments\Form\SimpleCommentForm;

class StaticCommentPlugin implements CommentPlugin
{
    public function getCurrentUser(): Consumer
    {
        return new StaticConsumer('1', 'Bob');
    }

    public function getSubjectFromParameters(...$parameters): Subject
    {
        return new StaticSubject($parameters[0]['subject'] ?? '123', 'Test page');
    }

    public function getAllComments(Subject $subject): CommentList
    {
        return new FlatCommentList(
            new StaticComment(
                'My awesome comment',
                new StaticParticipator('1', 'Bob', '#'),
                new StaticSubject('1', 'Something interesting', '#')
            ),
            new StaticComment(
                'My awesome comment 2',
                new StaticParticipator('2', 'Alice'),
                new StaticSubject('1', 'Something interesting', '#')
            )
        );
    }

    public function getCommentForm(): string
    {
        return SimpleCommentForm::class;
    }

    public function createCommentFromPost(...$parameters): Comment
    {
        return StaticComment::fromString($parameters['comment'] ?? 'this is the comment');
    }

    public function canSendComment(Consumer $consumer, Subject $subject = null): bool
    {
        return true;
    }

    public function sendComment(Comment $comment, CommentList $list): CommentList
    {
        $list->addComment($comment);

        return $list;
    }
}
