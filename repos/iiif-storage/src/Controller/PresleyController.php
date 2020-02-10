<?php


namespace IIIFStorage\Controller;


use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use Digirati\OmekaShared\Model\FieldValue;
use Digirati\OmekaShared\Model\ItemRequest;
use IIIFStorage\JsonBuilder\CollectionBuilder;
use IIIFStorage\JsonBuilder\ManifestBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Repository\CollectionRepository;
use IIIFStorage\Repository\ManifestRepository;
use Omeka\Api\Exception\NotFoundException;
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
    /**
     * @var CollectionBuilder
     */
    private $collectionBuilder;

    public function __construct(
        ManifestBuilder $builder,
        ManifestRepository $repo,
        CanvasRepository $canvasRepo,
        CollectionRepository $collectionRepo,
        CollectionBuilder $collectionBuilder,
        Acl $acl
    ) {
        $this->builder = $builder;
        $this->repo = $repo;
        $this->canvasRepo = $canvasRepo;
        $this->collectionRepo = $collectionRepo;
        $this->acl = $acl;
        $this->collectionBuilder = $collectionBuilder;
    }

    public function getSingleCollectionById(string $collectionId)
    {
        $match = $this->matchOnRoute($collectionId, 'iiif-storage/collection');
        if (!$match) {
            throw new NotFoundException();
        }

        $collectionId = $match->getParam('collection');

        return $this->redirect()->toRoute('iiif-storage/collection', ['collection' => $collectionId]);
    }

    /**
     * Returns root collection with all manifest collections
     */
    public function getRootCollectionAction()
    {
        $this->allowCors();

        $manifests = $this->repo->getNonReplacements();

        $collectionId = $this->params()->fromQuery('collection_id');
        if ($collectionId) {
            return $this->getSingleCollectionById($collectionId);
        }

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
        $json['members'] = array_map(function ($manifest) {
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

    // POST /presley/collection/add - creating collection (data = collection)
    public function addCollectionAction()
    {
        $request = $this->getRequest();
        if ($request->isOptions()) {
            return $this->preflightAction();
        }
        $this->allowCors();

        $collectionJson = json_decode($this->getRequest()->getContent(), true);

        $collectionItem = $this->collectionRepo->create(function (ItemRequest $item) use ($collectionJson) {
            $item->addField(
                FieldValue::url('dcterms:identifier', 'Collection URI', $collectionJson['@id'])
            );

            $label = $collectionJson['label'] ?? 'Untitled collection';
            $item->addFields(
                FieldValue::literalsFromRdf('dcterms:title', 'Label', $label)
            );

            $item->addField(
                FieldValue::literal('dcterms:source', 'Source', json_encode($collectionJson, JSON_UNESCAPED_SLASHES))
            );
        });

        $collection = $this->collectionBuilder->build($collectionItem);

        return new JsonResponse($collection->getJson());
    }

    // POST /presley/collection/delete {collection: 'http://..'} - remove collection with ID.
    public function deleteCollectionAction()
    {
        $request = $this->getRequest();
        if ($request->isOptions()) {
            return $this->preflightAction();
        }
        $this->allowCors();

        $collectionUrl = $this->params()->fromQuery('collection') ?: $this->params()->fromQuery('collection_id');

        $match = $this->matchOnRoute($collectionUrl, 'iiif-storage/collection');
        if (!$match) {
            throw new NotFoundException();
        }

        $collectionId = $match->getParam('collection');

        $this->collectionRepo->delete((int)$collectionId);

        return new JsonResponse([
            'result' => 'success'
        ]);
    }

    // GET /presley/manifest?manifest_id={full-url} - get manifest
    public function getManifestAction()
    {
        $manifestUrl = $this->params()->fromQuery('manifest_id');
        $match = $this->matchOnRoute($manifestUrl, 'iiif-storage/manifest');
        if (!$match) {
            throw new NotFoundException();
        }

        $manifestId = $match->getParam('manifest');

        return $this->redirect()->toRoute('iiif-storage/manifest', ['manifest' => $manifestId]);
    }

    // POST /presley/manifest/add - post manifest (data = manifest)
    public function addManifestAction()
    {
        $request = $this->getRequest();
        if ($request->isOptions()) {
            return $this->preflightAction();
        }
        $this->allowCors();

        $manifestJson = json_decode($this->getRequest()->getContent(), true);

        // @todo check for existing ID.

        $manifestItem = $this->repo->create(function (ItemRequest $item) use ($manifestJson) {
            $item->addField(
                FieldValue::url('dcterms:identifier', 'Collection URI', $manifestJson['@id'])
            );

            $label = $manifestJson['label'] ?? 'Untitled manifest';
            $item->addFields(
                FieldValue::literalsFromRdf('dcterms:title', 'Label', $label)
            );

            $item->addField(
                FieldValue::literal('dcterms:source', 'Source', json_encode($manifestJson, JSON_UNESCAPED_SLASHES))
            );

            $summary = $manifestJson['description'] ?? null;
            if ($summary) {
                $item->addFields(
                    FieldValue::literalsFromRdf('dcterms:description', 'Summary', $summary)
                );
            }

            $attribution = $manifestJson['attribution'] ?? null;
            if ($attribution) {
                $item->addFields(
                    FieldValue::literalsFromRdf('sc:attributionLabel', 'Attribution', $attribution)
                );
            }

            if (isset($manifestJson['otherContent']) && !empty($manifestJson['otherContent'])) {
                $item->addFields(
                    array_map(function ($otherContent) {
                        return FieldValue::url('sc:hasLists', $otherContent['label'], $otherContent['@id']);
                    }, $manifestJson['otherContent'])
                );
            }

            // @todo Services
            //   These will be custom media items, either specific to the service with custom UI and functionality
            //   bridging other parts of the platform, or generic for external and custom services.
        });

        $manifest = $this->builder->build($manifestItem);

        return new JsonResponse($manifest->getJson());
    }

    // POST /presley/manifest/delete {manifest: 'http://..'} - remove manifest with ID.
    public function deleteManifestAction()
    {
        $request = $this->getRequest();
        if ($request->isOptions()) {
            return $this->preflightAction();
        }
        $this->allowCors();

        $manifestUrl = $this->params()->fromQuery('manifest');

        $match = $this->matchOnRoute($manifestUrl, 'iiif-storage/manifest');
        if (!$match) {
            throw new NotFoundException();
        }

        $collectionId = $match->getParam('manifest');

        $this->repo->delete((int)$collectionId);

        return new JsonResponse([
            'result' => 'success'
        ]);
    }

    // GET /presley/canvas?canvas_id=http://... - get canvas
    public function getCanvasAction()
    {
        $manifestUrl = $this->params()->fromQuery('canvas_id');
        $match = $this->matchOnRoute($manifestUrl, 'iiif-storage/canvas');
        if (!$match) {
            throw new NotFoundException();
        }

        $canvasId = $match->getParam('canvas');

        return $this->redirect()->toRoute('iiif-storage/canvas', ['canvas' => $canvasId]);
    }

    // POST /presley/manifest/service/add { @id, service } - add service
    public function addServiceToManifestAction()
    {
        throw new \Error('Not implemented');
    }

    // POST /presley/canvas/otherContent/add - { @id, otherContent } - add other content
    public function addOtherContentToCanvasAction()
    {
        throw new \Error('Not implemented');
    }

    // POST /presley/canvas/service/add - { @id, service } - add service
    public function addServiceToCanvasAction()
    {
        throw new \Error('Not implemented');
    }

    // POST manifest/redact json={"@id": manifest}
    // POST /manifest/redact', json={"@id": manifest, "undo": True}
    public function redactManifestAction()
    {
        throw new \Error('Not implemented');
    }

    // POST /canvas/redact json={"@id": canvas}
    // POST /canvas/redact', json={"@id": manifest, "undo": True}
    public function redactCanvasAction()
    {
        throw new \Error('Not implemented');
    }

    // POST /presley/login for JWT?
    //  - POST { username, password } -> { token }
    public function loginAction()
    {
        throw new \Error('Not implemented');
    }
}
