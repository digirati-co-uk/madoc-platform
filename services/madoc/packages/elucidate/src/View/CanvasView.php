<?php

namespace ElucidateModule\View;

use Elucidate\ClientInterface;
use Elucidate\Search\SearchByTarget;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use ElucidateModule\Domain\Transcription;
use ElucidateModule\Form\CommentForm;
use ElucidateModule\Form\CompletionForm;
use Digirati\OmekaShared\Helper\UrlHelper;
use ElucidateModule\Subscriber\CompletionSubscriber;
use Omeka\Entity\User;
use Zend\Authentication\AuthenticationServiceInterface;
use GuzzleHttp\Client;
use IIIF\Model\Canvas;
use Zend\EventManager\Event;
use Zend\View\Model\ViewModel;

class CanvasView
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
    private $auth;
    private $transcriptionsEndpoint;
    private $http;

    public function __construct(
        ClientInterface $elucidate,
        ElucidateAnnotationMapper $mapper,
        array $config,
        UrlHelper $url,
        AuthenticationServiceInterface $auth,
        Client $http
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
        $this->transcriptionsEndpoint = $config['transcriptions_endpoint'] ?? null;
        $this->path = $config['path'];
        $this->elucidate = $elucidate;
        $this->mapper = $mapper;
        $this->auth = $auth;
        $this->http = $http;
    }

    public function mapSingleItem($item)
    {
        return $this->mapper->mapSingleAnnotation($item);
    }

    public function render(ViewModel $viewModel, Event $event)
    {
        /** @var Canvas $canvas */
        $canvas = $event->getParam('canvas');
        $flaggingEndpoint = $this->url->create('site/elucidate_flagging',
            [],
            [
                'query' => [
                    'subject' => $canvas->getId(),
                ],
            ],
            true
        );

        $canvas->addMetaData([
            'flagActionEndpoint' => $flaggingEndpoint,
            'commentForm' => CommentForm::create($canvas->getId(), $this->url->create('site/service_comment', [], [], true)),
        ]);


        try {
            $container = $this->elucidate->getContainer(md5($canvas->getId()));
        } catch (\Throwable $e) {
            return null;
        }
        $annotationsJson = $container->first['items'] ?? [];
        $annotations = [];
//        $annotations = array_map([$this, 'mapSingleItem'], $annotationsJson ?? []);

        $isComplete = false === empty(array_filter($annotationsJson, function ($annotation) {
                $motivation = $annotation['motivation'] ?? '';
                if (is_array($motivation)) {
                    return in_array(CompletionSubscriber::COMPLETION_MOTIVATION, $motivation);
                }
                return strtolower($motivation) === CompletionSubscriber::COMPLETION_MOTIVATION;
            }));

        $annotationsList = new SortableAnnotationList($annotations);

//        $isComplete = false === empty($annotationsList->onlyMotivations(CompletionSubscriber::COMPLETION_MOTIVATION)->get());
        $comments = array_map(
            function ($anno) {
                return Transcription::fromAnnotation($anno['rawAnnotation']);
            },
            $annotationsList->onlyMotivations('commenting')->get()
        );

        $completionForm = CompletionForm::create($canvas->getId(), $isComplete);
        // $bookmarkAnnotations = $annotationsList->onlyMotivations('bookmarking')->get();
        $identity = $this->auth->getIdentity();
        $hasBookmark = false;

        /** @var User $identity */
        if ($identity) {
            $emailDigest = sha1($identity->getEmail());
            $bookmarks = array_filter($annotationsJson, function ($annotation) {
                $motivation = $annotation['motivation'] ?? '';
                if (is_array($motivation)) {
                    return in_array('bookmarking', $motivation);
                }
                return strtolower($motivation) === 'bookmarking';
            });

            foreach ($bookmarks as $bookmark) {

                if (isset($bookmark['creator']) && $bookmark['creator']['email_sha1'] === $emailDigest) {
                    $hasBookmark = true;
                    break;
                }
            }
        }

        $viewModel->setVariable('annotations', $annotations);
        $viewModel->setVariable('annotationsSortable', $annotationsList->withoutMotivations('bookmarking'));
        $viewModel->setVariable('annotationsJson', $annotationsJson);
        $viewModel->setVariable('hasBookmark', $hasBookmark);
        $viewModel->setVariable('pageMarkedAsComplete', $isComplete);
        $viewModel->setVariable('completionForm', $completionForm);
        $viewModel->setVariable('comments', $comments);

        $image = $canvas->getImage();
        if ($image && $this->transcriptionsEndpoint) {
            $transcription = sprintf($this->transcriptionsEndpoint, $image->getImageService()->getId());
            $response = $this->http->get($transcription);
            $annotations = json_decode($response->getBody()->getContents(), true);
            $viewModel->setVariable('textTranscription', array_values($annotations ?? [])[0] ?? '');
        }
    }
}
