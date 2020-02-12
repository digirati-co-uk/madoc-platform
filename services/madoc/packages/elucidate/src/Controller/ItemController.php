<?php

namespace ElucidateModule\Controller;

use ElucidateModule\Domain\Topics\TopicTypeRepository;
use Digirati\OmekaShared\Helper\UrlHelper;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Representation\ItemRepresentation;
use Omeka\Api\Representation\MediaRepresentation;
use Omeka\Api\Representation\ResourceClassRepresentation;
use Omeka\Api\Representation\ResourceTemplatePropertyRepresentation;
use Omeka\Api\Representation\ResourceTemplateRepresentation;
use Zend\Authentication\AuthenticationService;
use Elucidate\ClientInterface;
use Elucidate\Search\SearchByBody;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use ElucidateModule\Domain\Topics\TopicType;
use Zend\View\Model\ViewModel;

final class ItemController extends TypedActionController
{
    private $hasVirtual;
    private $searchUsingClass;
    private $elucidateSearchUri;
    private $searchHttps;
    private $virtualPrefix;
    private $path;
    private $elucidate;
    private $fieldName;
    private $fieldIsProperty;
    private $mapper;
    private $searchField;
    private $topicTypes;
    private $searchUsingUri;
    private $authentication;
    private $url;
    private $topicTypeRepository;
    private $topicCollectionUri;
    private $universalViewerEndpoint;

    /**
     * Identifier of the `mainEntityOfPage` term in the schema.org vocabulary.
     */
    const ENTITY_OF_PAGE_ID = 763;

    /**
     * ItemController constructor.
     *
     * @param ClientInterface           $elucidate
     * @param ElucidateAnnotationMapper $mapper
     * @param AuthenticationService     $authentication
     * @param UrlHelper                 $url
     * @param array                     $config
     * @param array                     $topicTypes
     * @param TopicTypeRepository       $topicTypeRepository
     */
    public function __construct(
        ClientInterface $elucidate,
        ElucidateAnnotationMapper $mapper,
        AuthenticationService $authentication,
        UrlHelper $url,
        array $config,
        array $topicTypes,
        TopicTypeRepository $topicTypeRepository
    ) {
        $this->fieldName = $config['field_name'];
        $this->fieldIsProperty = $config['field_is_property'];
        $this->searchUsingClass = $config['search_using_class'] ? $config['search_using_class'] : false;
        $this->hasVirtual = $config['has_virtual'] ? $config['has_virtual'] : false;
        $this->virtualPrefix = $config['virtual_prefix'] ? $config['virtual_prefix'] : 'virtual';
        $this->elucidateSearchUri = $config['search_uri'] ? $config['search_uri'] : null;
        $this->searchHttps = $config['search_https'] ? $config['search_https'] : true;
        $this->path = $config['path'];
        $this->elucidate = $elucidate;
        $this->mapper = $mapper;
        $this->searchField = $config['search_by_id'] ? 'id' : 'source';
        $this->searchUsingUri = $config['search_using_uri'] ?? true;
        $this->topicTypes = $topicTypes;
        $this->authentication = $authentication;
        $this->topicCollectionUri = $config['topic_collection_uri'] ?? null;
        $this->url = $url;
        $this->topicTypeRepository = $topicTypeRepository;
        $this->universalViewerEndpoint = $config['universal_viewer_endpoint'] ?? null;
    }

    public function createItemAction()
    {
        /** @var \Omeka\Entity\User $user */
        $user = $this->authentication->getIdentity();
        if ($user && 'global_admin' !== $user->getRole()) {
            throw new NotFoundException();
        }

        $topicPage = $this->params()->fromPost('topic-page');
        $topicSlug = array_reverse(array_filter(explode('/', $topicPage)))[0] ?? null;
        $topicType = array_reverse(array_filter(explode('/', $topicPage)))[1] ?? null;
        if (null === $topicSlug || null === $topicType) {
            throw new NotFoundException();
        }
        $topic = $this->topicTypeRepository->findOneByClass($topicType);

        if (null === $topic) {
            throw new NotFoundException();
        }

        $query = $this->getQueryFromUri($topicType, $topicSlug);
        if ($query) {
            $response = $this->getApi()->searchOne('items', $query);
            $item = $response->getContent();
            if ($item) {
                $this->redirect()->toUrl('/admin/item/'.$item->id().'/edit');

                return;
            }
        }

        $resp = $this->getApi()->search('resource_templates')->getContent();

        $filtered = array_filter($resp, function (ResourceTemplateRepresentation $item) use ($topic) {
            return $item->label() === 'IDA-'.$topic->getLabel() || $item->label() === 'IDA:'.$topic->getLabel();
        });

        if (empty($filtered)) {
            throw new NotFoundException();
        }

        // Now we have resource template + basic field.
        /** @var ResourceTemplateRepresentation $resourceTemplate */
        $resourceTemplate = array_shift($filtered);
        $t = array_filter($resourceTemplate->resourceTemplateProperties(), function (ResourceTemplatePropertyRepresentation $prop) {
            return 'schema:mainEntityOfPage' === $prop->property()->term();
        });
        $fieldId = $t ? array_shift($t)->property()->id() : static::ENTITY_OF_PAGE_ID;
        /** @var ResourceClassRepresentation $resourceClass */
        $resourceClass = $resourceTemplate->resourceClass();
        $resourceClassId = $resourceClass ? $resourceClass->id() : null;

        $postMessage = [
            'o:resource_template' => ['o:id' => $resourceTemplate->id()],
            'o:resource_class' => ['o:id' => $resourceClassId],
            'dcterms:title' => [
                [
                    'property_id' => 1,
                    'type' => 'literal',
                    '@value' => ucfirst(preg_replace('/\+/', ' ', $topicSlug)),
                ],
            ],
            'schema:mainEntityOfPage' => [
                [
                    'property_id' => $fieldId,
                    'type' => 'uri',
                    '@id' => $topicPage,
                    'o:label' => $topicSlug,
                ],
            ],
            'o:is_public' => 1,
        ];

        /** @var ItemRepresentation $created */
        $created = $this->getApi()->create('items', $postMessage)->getContent();

        $this->redirect()->toUrl('/admin/item/'.$created->id().'/edit');
    }

    public function viewAction()
    {
        // Grab params from the URI.
        $id = $this->params('id');
        $class = $this->params('class');
        $site = $this->getCurrentSite();
        $item = null;

        // If we know we have a virtual, short circuit to search.
        if ($this->hasVirtual && 0 === strpos($class, $this->virtualPrefix)) {
            $item = null;
        } else {
            // Search for the item.
            $query = $this->getQueryFromUri($class, $id);
            if ($query) {
                $response = $this->getApi()->searchOne('items', $query);
                $item = $response->getContent();
            }
        }

        // Search using elucidate.
        $results = $this->elucidate->performSearch(new SearchByBody([$this->searchField], $this->getCurrentResource()));
        $annotationsJson = json_decode($results->getBody(), true);
        $annotations = $this->mapper->mapAnnotations($annotationsJson);

        $topicType = ucwords($class);

        $topic = (null !== $item) ? $item->displayTitle() : ucwords(urldecode($id));

        $topicPath = array_reduce($this->topicTypes, function ($state, TopicType $topic) use ($class) {
            if (!$state && $topic->represents($class)) {
                return $topic->getLabel();
            }

            return $state;
        }, null);
        $data = [
            'item_id' => $id,
            'topic' => $topic,
            'topicType' => $topicType,
            'topicPath' => $topicPath,
            'site' => $site,
            'results' => $annotationsJson,
            'annotations' => $annotations,
            'annotationsSortable' => new SortableAnnotationList($annotations),
            'topicCollection' => $this->topicCollectionUri ? implode('/', [$this->topicCollectionUri, $class, $id]) : null,
            'universalViewerEndpoint' => $this->universalViewerEndpoint,
        ];

        if ($item) {
            $data['item'] = $item;
            $data['itemJson'] = json_decode(json_encode($item), true);
            $data['itemFields'] = [];

            foreach ($data['itemJson'] as $fieldKey => $fieldValue) {
                if (
                    '@' === $fieldKey[0] ||
                    $fieldKey[0].$fieldKey[1] === 'o:' ||
                    'schema:mainEntityOfPage' === $fieldKey
                ) {
                    continue;
                }
                $data['itemFields'][] = [
                    'label' => $fieldValue[0]['property_label'] ?? '',
                    'value' => $fieldValue[0]['@value'] ?? $fieldValue[0]['o:label'] ?? '',
                    'url' => $fieldValue[0]['@id'] ?? null,
                ];
            }

            /** @var \Omeka\Entity\User $user */
            $user = $this->authentication->getIdentity();
            if ($user && 'global_admin' === $user->getRole()) {
                $data['itemCreatedAt'] = $data['itemJson']['o:created']['@value'];
                $data['itemCreatedBy'] = $item->owner() ? $item->owner()->name() : null;
            }
            /** @var ItemRepresentation $item */
            $data['itemImages'] = array_map(function(MediaRepresentation $media) {
                return [
                    'label' => $media->displayTitle(),
                    'url' => $media->originalUrl(),
                    'thumbnail' => $media->thumbnailUrls() // [small, medium, large, square]
                ];
            }, $item->media());
        }
        $user = $this->authentication->getIdentity();
        if ($user && 'global_admin' === $user->getRole()) {
            $data['editLink'] = true;
        }
        $data['flagActionEndpoint'] = $this->url->create('site/elucidate_flagging',
            [],
            [
                'query' => [
                    'subject' => $this->url->create(null, [], ['force_canonical' => true], true),
                ],
                'force_canonical' => true,
            ],
            true
        );
        // Return view model.
        $vm = new ViewModel($data);
        $vm->setTemplate('elucidate/item/view');

        return $vm;
    }

    public function getQueryFromUri($class, $id)
    {
        $query = $this->searchUsingClass ? ['class' => $class] : [];
        $value = $this->searchUsingUri ? $this->getCurrentResource() : $id;
        if ($this->fieldIsProperty) {
            $query['property'][] = [
                'property' => $this->fieldName,
                'type' => 'eq',
                'text' => strtolower($value),
            ];

            return $query;
        }
        if ('id' === $this->fieldName) {
            if (0 === (int) $id) {
                return null;
            }
            $query['id'] = (int) $id;

            return $query;
        }
        $query[$this->fieldName] = strtolower($id);

        return $query;
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

        return (string) $uri;
    }
}
