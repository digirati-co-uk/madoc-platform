<?php

namespace ElucidateModule\Controller;

use Elucidate\Adapter\GuzzleHttpAdapter;
use Elucidate\ClientInterface;
use ElucidateModule\Domain\ElucidateAnnotationMapper;
use ElucidateModule\Domain\SortableAnnotationList;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\ViewModel;

class SearchController extends AbstractActionController
{
    private $elucidate;
    private $searchHttps;
    private $elucidateSearchUri;
    private $mapper;
    private $searchField;
    private $mathmos;

    public function __construct(
        GuzzleHttpAdapter $mathmos,
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
        $this->mathmos = $mathmos;
    }

    public function resultsAction()
    {
        $query = $this->params()->fromQuery('q');

        if (!$query) {
            return (new ViewModel())->setTemplate('elucidate/search/landing');
        }

        $response = $this->mathmos->get('search/w3c?q='.$query);
        $results = $this->mapper->mapSearch(json_decode($response->getBody(), true));

        $vm = new ViewModel([
            'query' => $query,
            'site' => null,
            'results' => json_decode($response->getBody()),
            'annotations' => $results,
            'annotationsSortable' => new SortableAnnotationList($results),
        ]);
        $vm->setTemplate('elucidate/search/results');

        return $vm;
    }
}
