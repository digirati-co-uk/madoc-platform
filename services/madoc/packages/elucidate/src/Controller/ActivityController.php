<?php

namespace ElucidateModule\Controller;

use Elucidate\ClientInterface;
use Elucidate\Search\AnnotationQueryBuilder;
use Elucidate\Search\AuthorQueryBuilder;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use Zend\View\Model\ViewModel;

class ActivityController extends TypedActionController
{
    private $elucidate;
    private $searchHttps;
    private $elucidateSearchUri;
    private $mapper;
    private $searchField;

    public function __construct(
        ClientInterface $elucidate,
        ElucidateAnnotationMapper $mapper,
        array $config
    ) {
        $this->elucidateSearchUri = $config['search_uri'] ? $config['search_uri'] : null;
        $this->searchHttps = $config['search_https'] ? $config['search_https'] : true;
        $this->searchField = $config['search_by_id'] ? 'id' : 'source';
        $this->elucidate = $elucidate;
        $this->searchHttps = true;
        $this->mapper = $mapper;
    }

    public function getCurrentResource(): string
    {
        $uri = clone $this->getCurrentRequest()->getUri();
        if ($this->elucidateSearchUri) {
            $uri->setHost($this->elucidateSearchUri);
            // @todo add option to retain port?
            $uri->setPort(null);
        }
        if ($this->searchHttps) {
            $uri->setScheme('https');
        }
        $uri->setPath('');

        return (string) $uri;
    }

    public function userActivityAction()
    {
        $creator = $this->params()->fromRoute('user');
        $results = $this->elucidate->performSearch(
            AuthorQueryBuilder::byCreator()->atLevel('annotation')->withId($creator)->build()
        );
        $user = $this->getApi()->read('users', $creator);

        $annotationsJson = json_decode($results->getBody(), true);
        $annotations = $this->mapper->mapAnnotations($annotationsJson);

        $vm = new ViewModel([
            'userDetails' => $user->getContent(),
            'creator' => $creator,
            'annotations' => $annotations,
            'annotationsSortable' => new SortableAnnotationList($annotations),
            'results' => $annotationsJson,
        ]);
        $vm->setTemplate('elucidate/activity/user-activity');

        return $vm;
    }

    public function canvasActivityAction()
    {
        $canvas = $this->params()->fromRoute('canvas');
        $realCanvas = base64_decode($canvas);
        $results = $this->elucidate->performSearch(
            AnnotationQueryBuilder::byTarget()->strict(true)->field($this->searchField, $realCanvas)->build()
        );

        $annotationsJson = json_decode($results->getBody(), true);
        $annotations = $this->mapper->mapAnnotations($annotationsJson);

        $vm = new ViewModel([
            'annotations' => $annotations,
            'annotationsSortable' => new SortableAnnotationList($annotations),
            'results' => $annotationsJson,
        ]);
        $vm->setTemplate('elucidate/activity/canvas-activity');

        return $vm;
    }
}
