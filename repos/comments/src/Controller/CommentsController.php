<?php

namespace Comments\Controller;

use Comments\Plugin\CommentPlugin;
use Omeka\Mvc\Exception\PermissionDeniedException;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class CommentsController extends AbstractActionController
{
    private $comments;

    public function __construct(CommentPlugin $comments)
    {
        $this->comments = $comments;
    }

    public function viewCommentsAction()
    {
        $subject = $this->comments->getSubjectFromParameters($this->params()->fromRoute());
        $comments = $this->comments->getAllComments($subject);
        $form = $this->getForm($this->comments->getCommentForm());

        $form->setRedirect(
            $this->getRequest()->getUriString()
        );

        return new ViewModel([
            'form' => $form,
            'subject' => $subject,
            'comments' => $comments,
        ]);
    }

    public function createCommentAction()
    {
        $post = $this->params()->fromPost();
        $params = $this->params()->fromRoute();
        $redirect = $this->params()->fromPost('redirect');

        $user = $this->comments->getCurrentUser();
        $subject = $this->comments->getSubjectFromParameters($params, $post);
        $comment = $this->comments
            ->createCommentFromPost($post)
            ->setAuthor($user)
            ->setSubject($subject);

        $commentList = $this->comments->getAllComments($subject);

        if (!$this->comments->canSendComment($user, $subject)) {
            throw new PermissionDeniedException('You are not allowed to comment on this page');
        }

        $newCommentList = $this->comments->sendComment($comment, $commentList);

        if ($redirect) {
            return $this->redirect()->toUrl($redirect);
        }

        return new ViewModel([
            'comments' => $newCommentList,
            'newComment' => $comment,
            'subject' => $subject,
            'user' => $user,
        ]);
    }
}
