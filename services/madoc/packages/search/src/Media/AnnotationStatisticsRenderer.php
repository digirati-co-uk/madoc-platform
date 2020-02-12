<?php

namespace MadocSearch\Media;


use Digirati\OmekaShared\Framework\MediaPageBlockDualRender;
use Digirati\OmekaShared\Framework\RenderMedia;
use GuzzleHttp\Client;
use Omeka\Api\Representation\SitePageBlockRepresentation;
use Zend\View\Model\ViewModel;
use Zend\View\Renderer\PhpRenderer;
use ZfcTwig\View\TwigRenderer;

class AnnotationStatisticsRenderer implements MediaPageBlockDualRender
{
    use RenderMedia;

    /**
     * @var TwigRenderer
     */
    private $twig;

    public function __construct(
        TwigRenderer $twig
    ) {
        $this->twig = $twig;
    }

    public function renderFromData(PhpRenderer $view, array $data, array $options = [])
    {
        try {
            /////// This is to demonstrate the Search indexing.
            $es = getenv('OMEKA__SEARCH_ELASTICSEARCH');
            $index = getenv('OMEKA__ANNOTATION_ES_INDEX');
            if (!$es || !$index) {
                return '';
            }

            $client = new Client(['base_uri' => $es]);
            $resp = $client->post("/$index/_search", [
                'headers' => [
                    'Content-Type' => 'application/json'
                ],
                'body' => json_encode([
                    "size" => 0,
                    "aggs" => [
                        "distinct_canvases" => [
                            "cardinality" => [
                                "field" => "uri.keyword"
                            ]
                        ]
                    ]
                ]),
            ]);

            $json = json_decode($resp->getBody()->getContents(), true);
            $vm = new ViewModel([
                'totalAnnotations' => $json['hits']['total'] ?? 0,
                'totalImages' => $json['aggregations']['distinct_canvases']['value'] ?? 0,
            ]);

            $vm->setTemplate('madoc-search/media/annotation-statistics');

            return $this->twig->render($vm);
        } catch (\Throwable $e) {
            return '';
        }
    }

    public function pageBlockOptions(SitePageBlockRepresentation $pageBlock): array
    {
        return [];
    }
}
