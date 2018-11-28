<?php

namespace CaptureModelImport\Controller;

use CaptureModelImport\Form\ImportForm;
use Omeka\Api\Manager;
use Omeka\Api\Representation\SiteRepresentation;
use Symfony\Component\Yaml\Yaml;
use Zend\Diactoros\Response\JsonResponse;
use Zend\Log\LoggerInterface;
use Zend\Mvc\Controller\AbstractActionController;
use Zend\Psr7Bridge\Psr7Response;
use Zend\View\Model\ViewModel;

class CaptureModelImportController extends AbstractActionController
{
    protected $logger;
    protected $api;
    protected $config;
    protected $fileObject;
    protected $createdArtifacts;

    public function __construct(Manager $api, LoggerInterface $logger, $config)
    {
        $this->config = $config;
        $this->api = $api;
        $this->logger = $logger;
        $this->createdArtifacts = array();
    }

    public function captureAction()
    {
        $view = new ViewModel();

        $resp = $this->api->search('sites');

        $siteList = array_reduce($resp->getContent(), function ($acc, SiteRepresentation $site) {
            $acc[$site->id()] = $site->title();

            return $acc;
        }, []);

        $importForm = new ImportForm();
        $importForm->setSiteList($siteList);
        $importForm->init();
        $view->setVariable('form', $importForm);

        return $view;
    }

    /**
     * Recursively pad out LD refs for items and itemsets.
     *
     * @param $jsonInput
     * @return mixed
     */
    private function getJson($jsonInput)
    {
        if (!empty($jsonInput['dcterms:hasPart'])) {
            $temp = array();
            foreach ($jsonInput['dcterms:hasPart'] as $part) {
                if ('resource' == $part->type()) {
                    $resource = $part->valueResource();
                    $type = $resource->getJsonLdType();

                    $json = $resource->jsonSerialize();
                    $tempJson = $this->getJson($json);
                    $json = empty($tempJson) ? $json : $tempJson;

                    array_push($temp, $json);
                }
            }
            //replace parts
            $jsonInput['dcterms:hasPart'] = $temp;
        }

        return $jsonInput;
    }

    /**
     * Action to retrieve expanded json given an omeka itemset or item.
     *
     * @return string|\Zend\Http\Response|\Zend\View\Model\ViewModel
     */
    public function inlineAction()
    {
        $id = $this->params()->fromRoute('id');

        try {
            $target = $this->api->read('item_sets', $id)->getContent();
        } catch (\Omeka\Api\Exception\NotFoundException $nfe) {
            try {
                $target = $this->api->read('items', $id)->getContent();
            } catch (\Omeka\Api\Exception\NotFoundException $nfe) {
                //log
                $message = 'Neither Item nor ItemSet could be found';
                $this->logger->alert($message, [
                    'id' => $id,
                ]);

                $this->getResponse()->setStatusCode(204);

                return $this->getResponse();
            }
        }

        $json = $target->jsonSerialize();

        $fullJson = $this->getJson($json);

        return Psr7Response::toZend(new JsonResponse($fullJson, http_response_code(200), [], JSON_PRETTY_PRINT + JSON_UNESCAPED_SLASHES));
    }

    /**
     * Process file, create CaptureModel.
     *
     * @return \Zend\Http\Response|ViewModel
     */
    public function processAction()
    {
        $view = new ViewModel();
        $request = $this->getRequest();
        $post = $this->params()->fromPost();

        $resourceType = 'Dummy Import';

        if (!$request->isPost()) {
            return $this->redirect()->toRoute('admin/model-import');
        }

        $files = $request->getFiles()->toArray();
        if (!empty($files)) {
            foreach ($files as $file) {
                if (strpos($file['name'], '.json')) {
                    $inputJSON = file_get_contents($file['tmp_name']); //'php://input');
                    //convert JSON into array
                    $input = json_decode($inputJSON, true);
                } elseif (strpos($file['name'], '.yaml')) {
                    $data = Yaml::parse(file_get_contents($file['tmp_name']));
                    $input = $data;
                }

                $job = $this->jobDispatcher()->dispatch(
                    'CaptureModelImport\Job\Import',
                    [
                        'file' => $file,
                        'input' => $input ?? null,
                        'site_id' => $post['resource_site'] ? $post['resource_site'] : null,
                    ]
                );

                $this->messenger()
                    ->addSuccess('Successfully created Job ID : '.$job->getId());

                return $this->redirect()->toRoute('admin/model-import/importing',
                    [
                        'action' => 'browse',
                    ],
                    [
                        'query' => array(
                            'jobId' => $job->getId(),
                        ),
                    ]);
            }
        }

        $view->setVariable('resourceType', $resourceType);

        return $view;
    }

    public function importingAction()
    {
        $jobId = $this->params()->fromQuery('jobId', null);

        return new ViewModel([
            'imports' => 'imports',
            'jobId' => $jobId,
        ]);
    }
}
