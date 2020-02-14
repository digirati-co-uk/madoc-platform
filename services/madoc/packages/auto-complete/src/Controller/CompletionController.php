<?php

namespace AutoComplete\Controller;

use AutoComplete\Completion\CompletionItem;
use AutoComplete\Completion\CompletionService;
use Exception;
use Zend\Http\Headers;
use Zend\Http\Response;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\View\Model\JsonModel;

class CompletionController extends AbstractActionController
{
    /**
     * @var CompletionService
     */
    private $completionService;

    public function __construct(CompletionService $completionService)
    {
        $this->completionService = $completionService;
    }

    private function errorMessage(string $message): Response
    {
        /** @var Response $response */
        $response = $this->getResponse();
        $response->setStatusCode(400);
        $response->setHeaders(Headers::fromString('Content-Type: application/json'));
        $response->setContent(json_encode(['error' => $message]));

        return $response;
    }

    public function completionsAction()
    {
        $resourceClasses = explode(',', $this->params()->fromQuery('class', []));
        $term = $this->params()->fromQuery('q');

        if ($term === null) {
            return $this->errorMessage('No search term provided'); // @translate
        }

        try {
            $completions = $this->completionService->getSuggestions($term, ...$resourceClasses);
        } catch (Exception $e) {
            return $this->errorMessage($e->getMessage());
        }
        usort($completions, function (CompletionItem $a, CompletionItem $b) {
            return $b->getScore() <=> $a->getScore();
        });

        $completionsJson = array_map(
            function (CompletionItem $item) {
                return [
                    'uri' => $item->getUri(),
                    'label' => $item->getTitle(),
                    'resource_class' => $item->getClass()
                ];
            },
            $completions
        );

        return new JsonModel([
            'completions' => $completionsJson
        ]);
    }
}
