<?php


namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use Omeka\Permissions\Acl;
use Zend\Diactoros\Response\JsonResponse;

class PresleyController extends AbstractPsr7ActionController
{

    /**
     * @var ManifestBuilder
     */
    private $builder;
    /**
     * @var ManifestRepository
     */
    private $repo;
    /**
     * @var CanvasRepository
     */
    private $canvasRepo;
    /**
     * @var CollectionRepository
     */
    private $collectionRepo;
    /**
     * @var Acl
     */
    private $acl;

    public function __construct(
        ManifestBuilder $builder,
        ManifestRepository $repo,
        CanvasRepository $canvasRepo,
        CollectionRepository $collectionRepo,
        Acl $acl
    ) {
        $this->builder = $builder;
        $this->repo = $repo;
        $this->canvasRepo = $canvasRepo;
        $this->collectionRepo = $collectionRepo;
        $this->acl = $acl;
    }

    /**
     * Returns root collection with all manifest collections
     */
    public function getRootCollectionAction()
    {
        $this->allowCors();
        $manifests = $this->repo->getNonReplacements();

        return new JsonResponse(
            [
                "@context" => "http://iiif.io/api/presentation/2/context.json",
                "@id" => $this->url()->fromRoute(null, [], ['force_canonical' => true], true),
                "@type" => "sc:Collection",
                "members" => array_map(function ($manifest) {
                    $json = $this->builder->build($manifest, false, 0, 1)->getJson();
                    $json['service'] = [
                        "highlight" => "info",
                        "profile" => "row-profile-here",
                        "values" => [
                            "",
                            $json['label'],
                            "",
                            "",
                            "",
                            ""
                        ]
                    ];
                    return $json;
                }, $manifests),
            ]
            , 200);
    }

    /**
     * Gets single derived manifest collection by ID
     *
     * @todo create fallback for collection IDs that are passed in, which will just return normal collections.
     */
    public function getManifestsCollectionAction()
    {
        $this->allowCors();

        $collectionId = $this->params()->fromRoute('collection');

        $manifestItem = $this->repo->getById($collectionId);
        $manifest = $this->builder->build($manifestItem);

        $manifests = $this->repo->getReplacements($collectionId);

        $json = $manifest->getJson();
        // Invalid on a collection
        unset($json['structures']);
        unset($json['sequences']);
        $json['@type'] = 'sc:Collection';
        $json['@id'] = $this->url()->fromRoute(null, [], ['force_canonical' => true], true);
        $json['members'] = array_map(function($manifest) {
            return $this->builder->build($manifest, false, 0, 1)->getJson();
        }, $manifests);

        return new JsonResponse($json);
    }

    /**
     * Adds derived manifest to the manifests collection
     */
    public function addManifestToCollectionAction()
    {
        $request = $this->getRequest();
        if ($request->isOptions()) {
            return $this->preflightAction();
        }
        $this->allowCors();

        $collectionId = $this->params()->fromRoute('collection');
        $body = json_decode($this->getRequest()->getContent(), true);
        $label = $body['label'] ?? 'Untitled manifest';
        $canvasIds = $body['canvasIds'] ?? [];

        $manifestItem = $this->repo->create(function (ItemRequest $item) use ($label, $collectionId, $canvasIds) {
            $item->addFields(
                FieldValue::literalsFromRdf('dcterms:title', 'Label', $label)
            );

            // Set the manifest URI to internal.
            $item->addField(
                FieldValue::url('dcterms:identifier', 'Manifest URI', 'uri:internal')
            );

            $item->addField(
                FieldValue::entity('dcterms:replaces', $collectionId, 'resource:item')
            );

            foreach ($canvasIds as $canvasId) {
                $item->addField(
                    FieldValue::entity('sc:hasCanvases', $this->extractCanvasId($canvasId))
                );
            }
        });

        $manifest = $this->builder->build($manifestItem);

        return new JsonResponse($manifest->getJson());
    }

    public function extractCanvasId($id)
    {
        preg_match('#iiif/api/canvas/([^/?]+)#', $id, $matches);
        return $matches[1] ?? null;
    }

    // Rest of Presley API.

    // GET /iiif/collection?collection={full-url} - Missing for real collections
    // POST /iiif/collection/add - creating collection (data = collection)
    // POST /iiif/collection/delete {collection: 'http://..'} - remove collection with ID.
    // GET /iiif/manifest?manifest={full-url} - get manifest
    // POST /iiif/manifest/add - post manifest (data = manifest)
    // POST /iiif/manifest/delete {manifest: 'http://..'} - remove manifest with ID.
    // POST /iiif/manifest/service/add { @id, service } - add service
    // GET /iiif/canvas?canvas=http://... - get canvas
    // POST /iiif/canvas/otherContent/add - { @id, otherContent } - add other content
    // POST /iiif/canvas/service/add - { @id, service } - add service
}
