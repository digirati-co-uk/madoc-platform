<?php

namespace IIIFStorage\Media;

use Doctrine\DBAL\Connection;
use IIIFStorage\JsonBuilder\CanvasBuilder;
use IIIFStorage\Repository\CanvasRepository;
use IIIFStorage\Utility\Router;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Media\Renderer\RendererInterface;
use PDO;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class LatestAnnotatedImagesRenderer implements RendererInterface, MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;
    /**
     * @var Connection
     */
    private $connection;
    /**
     * @var CanvasRepository
     */
    private $repository;
    /**
     * @var CanvasBuilder
     */
    private $canvasBuilder;
    /**
     * @var Router
     */
    private $router;

    public function __construct(
        TwigRenderer $twig,
        Connection $connection,
        CanvasRepository $repository,
        CanvasBuilder $canvasBuilder,
        Router $router
    ) {
        $this->twig = $twig;
        $this->connection = $connection;
        $this->repository = $repository;
        $this->canvasBuilder = $canvasBuilder;
        $this->router = $router;
    }

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        $numberOfImages = (int)$data['number-of-images'] ?? 4;

        $query = 'SELECT user_id, canvas_mapping_id from user_canvas_mapping ORDER BY id DESC LIMIT :limit';
        $userQuery = 'SELECT id, name from user WHERE id = :id';

        $statement = $this->connection->prepare($query);
        $statement->bindValue('limit', $numberOfImages, PDO::PARAM_INT);
        $statement->execute();

        $results = $statement->fetchAll();

        $canvases = [];
        foreach ($results as $result) {
            $userStatement = $this->connection->prepare($userQuery);
            $userStatement->bindValue('id', (int)$result['user_id'], PDO::PARAM_INT);
            $userStatement->execute();
            $user = $userStatement->fetch();

            $canvases[] = [
                'user' => [
                    'id' => $user['id'] ?? '',
                    'name' => $user['name'] ?? 'unknown',
                ],
                'resource' => $this->canvasBuilder->buildResource(
                    $this->repository->getById($result['canvas_mapping_id'])
                ),
            ];
        }

        $vm = new ViewModel([
            'title' => $data['title'],
            'numberOfImages' => $numberOfImages,
            'canvases' => $canvases,
            'router' => $this->router,
        ]);
        $vm->setTemplate('iiif-storage/media/latest-annotated-images');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}
