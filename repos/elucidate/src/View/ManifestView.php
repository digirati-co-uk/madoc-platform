<?php

namespace ElucidateModule\View;

use Elucidate\ClientInterface;
use Elucidate\Search\SearchByTarget;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use ElucidateModule\Domain\Transcription;
use ElucidateModule\Form\CommentForm;
use Digirati\OmekaShared\Helper\UrlHelper;
use IIIF\Model\Manifest;
use Zend\EventManager\Event;
use Zend\View\Model\ViewModel;

class ManifestView
{
    private $searchField;
    private $fieldName;
    private $virtualPrefix;
    private $fieldIsProperty;
    private $searchUsingClass;
    private $hasVirtual;
    private $elucidateSearchUri;
    private $searchHttps;
    private $path;
    private $elucidate;
    private $mapper;
    private $url;

    public function __construct(
        ClientInterface $elucidate,
        ElucidateAnnotationMapper $mapper,
        array $config,
        UrlHelper $url
    ) {
        $this->url = $url;
        $this->fieldName = $config['field_name'];
        $this->fieldIsProperty = $config['field_is_property'];
        $this->searchUsingClass = $config['search_using_class'] ? $config['search_using_class'] : false;
        $this->hasVirtual = $config['has_virtual'] ? $config['has_virtual'] : false;
        $this->virtualPrefix = $config['virtual_prefix'] ? $config['virtual_prefix'] : 'virtual';
        $this->elucidateSearchUri = $config['search_uri'] ? $config['search_uri'] : null;
        $this->searchHttps = $config['search_https'] ? $config['search_https'] : true;
        $this->searchField = !$config['search_by_id'] ? 'id' : 'source';
        $this->path = $config['path'];
        $this->elucidate = $elucidate;
        $this->mapper = $mapper;
    }

    public function mapSingleItem($item)
    {
        return $this->mapper->mapSingleAnnotation($item);
    }

    public function render(ViewModel $viewModel, Event $event)
    {
        /** @var Manifest $manifest */
        $manifest = $event->getParam('manifest');
        $manifest->addMetaData([
            'flagActionEndpoint' => $this->url->create('site/elucidate_flagging', [], ['query' => [
                'subject' => $manifest->getId(),
            ]], true),
            'commentForm' => $manifest->commentForm ? $manifest->commentForm : CommentForm::create($manifest->getId(), $this->url->create('site/service_comment', [], [], true)),
        ]);

        $results = $this->elucidate->performSearch(new SearchByTarget(['id', 'source'], $manifest->getId()));

        $annotationsJson = json_decode($results->getBody(), true);

        $annotations = array_map([$this, 'mapSingleItem'], $annotationsJson['first']['items'] ?? []);
        $annotationsList = new SortableAnnotationList($annotations);

        $comments = array_map(
            function ($anno) {
                return Transcription::fromAnnotation($anno['rawAnnotation']);
            },
            $annotationsList->onlyMotivations('commenting')->get()
        );

        $viewModel->setVariable('manifestAnnotations', $annotations);
        $viewModel->setVariable('manifestAnnotationsSortable', $annotationsList->withoutMotivations('bookmarking'));
        $viewModel->setVariable('manifestAnnotationsJson', $annotationsJson);
        $viewModel->setVariable('manifestHasBookmark', $annotationsList->onlyMotivations('bookmarking')->get());
        $viewModel->setVariable('comments', $comments);
        $viewModel->setVariable('commentForm', $manifest->commentForm);
    }
}
