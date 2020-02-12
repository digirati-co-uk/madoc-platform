<?php

namespace ElucidateModule\Controller;

use ElucidateModule\Domain\Topics\TopicTypeRepository;
use ElucidateModule\Service\TopicFinder;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

final class TopicTypesController extends AbstractActionController
{
    /**
     * @var TopicTypeRepository
     */
    private $topicTypes;

    /**
     * @var TopicFinder
     */
    private $topics;

    public function __construct(TopicTypeRepository $topicTypes, TopicFinder $topics)
    {
        $this->topicTypes = $topicTypes;
        $this->topics = $topics;
    }

    public function indexAction()
    {
        $types = $this->topicTypes->findAllInList();
        if (0 === count($types)) {
            return $this->notFoundAction();
        }

        $topicGroups = $this->topics->findByTypes(...$types);

        $viewModel = new ViewModel();
        $viewModel->setTemplate('elucidate/topic-types/index');
        $viewModel->setVariables([
            'site' => $this->currentSite(),
            'types' => $types,
            'topicGroups' => $topicGroups,
        ]);

        return $viewModel;
    }

    public function viewAction()
    {
        $name = $this->params()->fromRoute('name');
        $type = $this->topicTypes->findOneByName($name);
        if (null === $type) {
            return $this->notFoundAction();
        }

        $topics = $this->topics->findByType($type);

        $viewModel = new ViewModel();
        $viewModel->setTemplate('elucidate/topic-types/view');
        $viewModel->setVariables([
            'site' => $this->currentSite(),
            'type' => $type,
            'topics' => $topics,
        ]);

        return $viewModel;
    }
}
