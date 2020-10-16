<?php

namespace AnnotationStudio\Controller;

use AnnotationStudio\CaptureModel\CaptureModelRepository;
use AnnotationStudio\CaptureModel\Router;
use AnnotationStudio\CaptureModel\VirtualChoice;
use Digirati\OmekaShared\Framework\AbstractPsr7ActionController;
use ML\JsonLD\JsonLD;
use Omeka\Api\Exception\NotFoundException;
use Omeka\Api\Representation\ItemSetRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Zend\Diactoros\Response\JsonResponse;
use Zend\Log\LoggerInterface;

/**
 * @method SiteRepresentation currentSite()
 * @method void               setBrowseDefaults(string $default)
 */
class CaptureModelController extends AbstractPsr7ActionController
{

    /**
     * @var CaptureModelRepository
     */
    private $repo;

    /**
     * @var LoggerInterface
     */
    private $logger;
    /**
     * @var Router
     */
    private $router;

    const DEFAULT_ID = '1337';
    const DEFAULT_TITLE = 'What do you want to annotate?'; // @translate
    const DEFAULT_DESC = 'Please choose from the options below'; // @translate
    const DEFAULT_HEADERS = [
        'Pragma' => 'cache',
        'Cache-Control' => 'max-age=300',
        'Access-Control-Allow-Origin' => '*',
    ];

    public function __construct(
        CaptureModelRepository $repo,
        LoggerInterface $logger,
        Router $router
    ) {
        $this->repo = $repo;
        $this->logger = $logger;
        $this->router = $router;
    }

    public function componentAction()
    {
        $this->setSiteId();
        $component = $this->params()->fromRoute('component');
        $moderation = $this->params()->fromRoute('moderation');
        $query = $this->params()->fromQuery();

        $models = $this->repo->getAllCaptureModels($component, $moderation, $query);

        if (!$models) {
            return new JsonResponse(['errors' => ['error' => 'No matching found']], 404, static::DEFAULT_HEADERS);
        }
        $models = 1 === sizeof($models) ?
            $this->encodeDocumentWithId(
                $this->router->model($models[0]['o:id'], $component, $moderation),
                $models[0]
            ) :
            $this->encodeDocumentWithId(
                $this->router->component($component, $moderation),
                new VirtualChoice(static::DEFAULT_ID, static::DEFAULT_TITLE, static::DEFAULT_DESC, $models)
            );

        return new JsonResponse($models, 200, static::DEFAULT_HEADERS);
    }

    public function captureModelAction()
    {
        $this->setSiteId();
        $model = $this->params()->fromRoute('model');
        $component = $this->params()->fromRoute('component');
        $moderation = $this->params()->fromRoute('moderation');
        $url = $this->router->model($model, $component, $moderation);

        try {
            /** @var ItemSetRepresentation $item */
            $item = $this->repo->findItemSet($model);
        } catch (NotFoundException $e) {
            $this->logger->info('Capture model not found', [
                'model' => $model,
                'component' => $component,
                'url' => $url,
                'exception' => (string)$e,
            ]);

            return new JsonResponse(['errors' => ['error' => 'No matching found']], 404, static::DEFAULT_HEADERS);
        }

        // Expand out choice fields (recursively)
        $item = $this->repo->expandDocument($item, $component, $moderation);
        // Encode into compacted JSON LD.
        $json = $this->encodeDocumentWithId($url, $item);

        return new JsonResponse(
            $json,
            200,
            static::DEFAULT_HEADERS
        );
    }

    public function translationAction() {
        $site = $this->currentSite();
        if ($site) {
            $file = __DIR__ . '/../../../../translations/s/' . $site->slug() . '/annotation-studio.json';
            if (is_file($file)) {
                $json = file_get_contents($file);
                if ($json) {
                    return new JsonResponse(
                        json_decode($json),
                        200,
                        static::DEFAULT_HEADERS
                    );
                }
            }
        }

        return new JsonResponse(
            [],
            200,
            static::DEFAULT_HEADERS
        );
    }

    public function preprocessTranslation($translation) {
        if (is_array($translation)) {
            $return = [];
            foreach ($translation as $lang => $list) {
                $return[$lang] = [];
                if (is_array($list)) {
                    foreach ($list as $key => $value) {
                        $return[$lang][str_replace('/./', '\.', $key)] = $value;
                    }
                }
            }
            return $return;
        }
        return $translation;
    }

    public function setSiteId()
    {
        $site = $this->currentSite();
        if ($site) {
            $this->router->setSiteId($site->slug());
            $this->repo->setSiteId($site->id(), $site->slug());
        }
    }

    private function getContext()
    {
        return $this->repo->apiContextFromEventManager($this->getEventManager());
    }

    public function encodeDocumentWithId($id, $item)
    {
        $encoded = json_decode(
            json_encode($item)
        );
        $encoded->{'@id'} = $id;

        // Compact JSON LD without context.
        return array_merge(
            ['@context' => $this->getContext()],
            (array)JsonLD::compact($encoded, '{}')
        );
    }
}
