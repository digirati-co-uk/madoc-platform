<?php

namespace ElucidateModule\Site\BlockLayout;

use Elucidate\ClientInterface;
use Elucidate\Search\AuthorQueryBuilder;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Omeka\Api\Representation\SitePageRepresentation;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Site\BlockLayout\AbstractBlockLayout;
use Throwable;
use Zend\Log\Logger;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

final class LatestAnnotations extends AbstractBlockLayout
{
    private $elucidate;
    private $mapper;
    private $logger;
    private $twig;

    public function __construct(
        ClientInterface $elucidate,
        ElucidateAnnotationMapper $mapper,
        Logger $logger,
        TwigRenderer $twig
    ) {
        $this->elucidate = $elucidate;
        $this->mapper = $mapper;
        $this->logger = $logger;
        $this->twig = $twig;
    }

    public function getLabel()
    {
        return 'Latest annotations'; // @translate
    }

    public function form(
        PhpRenderer $view,
        SiteRepresentation $site,
        SitePageRepresentation $page = null,
        SitePageBlockRepresentation $block = null
    ) {
        return 'Shows the last images that have been annotated for this site'; // @translate
    }

    public function render(PhpRenderer $view, SitePageBlockRepresentation $block)
    {
        /** @var SiteRepresentation $site */
        $site = $block->page()->site();

        $queryBuilder = AuthorQueryBuilder::byGenerator();
        $query = $queryBuilder->strict(false)
            ->atLevel('annotation')
            ->withId($site->siteUrl(null, true))
            ->build();

        try {
            $results = $this->elucidate->performSearch($query);
            $annotationsJson = json_decode($results->getBody(), true);
            $annotations = $this->mapper->mapAnnotations($annotationsJson);
            $annotationList = new SortableAnnotationList($annotations);
            $allAnnotations = $annotationList->groupByCanvas()->get();
        } catch (Throwable $e) {
            $this->logger->err((string) $e);

            return '';
        }

        return $this->twig->render('elucidate/block-layout/latest-annotations', [
            'annotations' => $annotationList,
            'numAnnotations' => 5, // @todo figure out block forms
            'allAnnotations' => $allAnnotations,
        ]);
    }
}
