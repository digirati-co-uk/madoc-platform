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

class TopContributorsRenderer implements RendererInterface, MediaPageBlockDualRender
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
        Router $router
    ) {
        $this->twig = $twig;
        $this->connection = $connection;
        $this->router = $router;
    }

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        $numberOfContributor = (int)$data['number-of-contributors'] ?? 4;

        $query = 'SELECT COUNT(id) as total_contributions, MAX(user_id) as user_id from user_canvas_mapping GROUP BY user_id ORDER BY COUNT(id) DESC LIMIT :limit';
        $userQuery = 'SELECT id, name from user WHERE id = :id';

        $statement = $this->connection->prepare($query);
        $statement->bindValue('limit', $numberOfContributor, PDO::PARAM_INT);
        $statement->execute();

        $results = $statement->fetchAll();

        $users = [];
        foreach ($results as $result) {
            $userStatement = $this->connection->prepare($userQuery);
            $userStatement->bindValue('id', (int)$result['user_id'], PDO::PARAM_INT);
            $userStatement->execute();
            $user = $userStatement->fetch();

            $users[] = [
                'id' => $user['id'] ?? '',
                'name' => $user['name'] ?? 'unknown',
                'contributions' => $result['total_contributions'] ?? 0,
            ];
        }

        $vm = new ViewModel([
            'title' => $data['title'],
            'users' => $users,
            'router' => $this->router,
        ]);
        $vm->setTemplate('iiif-storage/media/top-contributors');
        return $this->twig->render($vm);
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}
