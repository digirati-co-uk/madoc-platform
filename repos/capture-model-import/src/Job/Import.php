<?php

namespace CaptureModelImport\Job;

use Omeka\Api\Manager;
use Omeka\Api\Representation\SiteRepresentation;
use Omeka\Job\AbstractJob;
use Spyc;
use Zend\Log\Logger;

class Import extends AbstractJob
{
    /** @var Manager */
    protected $api;

    protected $addedCount;

    /** @var Logger */
    protected $logger;

    protected $hasErr = false;

    public function perform()
    {
        ini_set('auto_detect_line_endings', true);
        $this->logger = $this->getServiceLocator()->get('Omeka\Logger');
        $this->api = $this->getServiceLocator()->get('Omeka\ApiManager');
        $file = $this->getArg('file');

        $this->logger->debug(sprintf('Reading file : %s', $file['name']));

        $data = $this->getArg('input');
        $siteId = $this->getArg('site_id');

        if (empty($data)) {
            $data = $this->readFile($file);
        }

        $captureModel = $this->importCaptureModel($data);

        $this->addCaptureModelToSite($siteId, $captureModel->id());
    }

    protected function createLinkages($input)
    {
        //get property for dcterms:hasPart
        $response = $this->api->search('properties', array('term' => 'dcterms:hasPart'));
        $content = $response->getContent();
        $propertyId = $content[0]->id();

        foreach ($input as $key => $value) {
            if ('dcterms:hasPart' == $key) {
                //is itemset or item?
                foreach ($value as $part) {
                    $inputId = $input['o:id'];
                    $partId = $part['o:id'];
                    $item = $this->createdArtifacts[$partId];
                    $parentItem = $this->createdArtifacts[$inputId];
                    //make link
                    $this->api->update(
                        'item_sets',
                        $parentItem->id(),
                        array(
                            'dcterms:hasPart' => array(
                                [
                                    'property_id' => $propertyId,
                                    'type' => 'resource',
                                    'value_resource_id' => $item->id(),
                                ],
                            ),
                        ),
                        [],
                        [
                            'isPartial' => true,
                            'collectionAction' => 'append',
                        ]
                    );

                    $this->logger->debug(sprintf('Linked %s to %s', $item->id(), $parentItem->id()));

                    $this->createLinkages($part);
                }
            }
        }
    }

    protected function importCaptureModel($input)
    {
        $inputData = $this->processData($input);

        // all created, create linkages
        $this->createLinkages($input);

        return $inputData;
    }

    protected function processData($input, $parent = null)
    {
        $formattedArray = array();

        foreach ($input as $key => $value) {
            $formattedArray[$key] = $this->formatField($key, $value);
        }

        //create
        if (in_array('o:ItemSet', $formattedArray['@type'])) {
            $response = $this->api->create('item_sets', $formattedArray, [], []);
            $content = $response->getContent();
            $this->createdArtifacts[$formattedArray['o:id']] = $content;
        } elseif (in_array('o:Item', $formattedArray['@type'])) {
            $response = $this->api->create('items', $formattedArray, [], []);
            $content = $response->getContent();
            $this->createdArtifacts[$formattedArray['o:id']] = $content;
        } else {
            $this->logger->error(sprintf('Tried to create unknown type %s', $formattedArray['@type'][0]));
        }

        if (!empty($content)) {
            $this->logger->debug(sprintf('Created %s : %s with ID:%s',
                $content->getResourceJsonLdType(), $formattedArray['dcterms:title'][0]['@value'], $content->id())); //$content->displayTitle()
        }

        return $content;
    }

    protected function formatField($key, $value)
    {
        //need to deal with boolean case
        $value = is_bool($value) ? ($value ? 'True' : 'False') : $value;
        //if array, might be either a resource or Uri, or literal
        $type = is_array($value) && (!array_key_exists('o:id', $value) && array_key_exists('@id', $value)) ? 'uri' : 'literal';

        if ('@' == substr($key, 0, 1)) {
            return $value;
        } elseif ('o:' == substr($key, 0, 2)) {
            return $value;
        } elseif ('dcterms:hasPart' == $key) {
            //is itemset or item?
            foreach ($value as $part) {
                $data = $this->processData($part);
            }
        } else {
            $response = $this->api->search('properties', array('term' => $key));
            $content = $response->getContent();
            if (empty($content)) {
                $this->logger->debug(sprintf('Property %s not available', $key));

                return null;
            }
            $propertyId = $content[0]->id();

            $retArr = array();

            if (1 == sizeof($content)) {
                //presumably input file has appropriate metadata
                //if only literal value then omeka requires this
                if (is_array($value)) {
                    if ('literal' == $type) {
                        //return array, with each value, along with properryId and type
                        $retVal = array();
                        foreach ($value as $item) {
                            $attribute = [
                                'property_id' => $propertyId,
                                'type' => $type,
                                '@language' => '',
                                '@value' => $item,
                            ];
                            array_push($retVal, $attribute);
                        }

                        return $retVal;
                    } else {
                        $value['property_id'] = $propertyId;
                        $value['type'] = $type;

                        return array($value);
                    }
                } else {
                    $retArr['property_id'] = $propertyId;
                    $retArr['type'] = $type;
                    $retArr['@value'] = $value;
                }

                return array($retArr);
            }
        }
    }

    protected function readFile($file)
    {
        if (strpos($file['name'], '.json')) {
            $inputJSON = file_get_contents($file['tmp_name']); //'php://input');
            //convert JSON into array
            $input = json_decode($inputJSON, true);
            $this->logger->info(sprintf('Read file %s', $file['name']));
        } elseif (strpos($file['name'], '.yaml')) {
            $data = Spyc::YAMLLoad($file['tmp_name']);
            $input = \GuzzleHttp\json_encode($data);
//      $input = $data;
            $this->logger->info(sprintf('Read file %s', $file['name']));
        }

        $this->logger->info(sprintf('File content : %s', $input));

        return $input;
    }

    private function addCaptureModelToSite($siteId, $captureModel)
    {
        $this->logger->debug("Adding $captureModel to $siteId");
        $itemSets = [
            [
                'o:item_set' => [
                    'o:id' => $captureModel,
                ],
            ],
        ];

        try {
            /** @var SiteRepresentation $site */
            $site = $this->api->read('sites', $siteId)->getContent();
            $siteJson = json_decode(json_encode($site), true);
            $this->logger->debug(json_encode($site, JSON_PRETTY_PRINT));
            $updateData = [
                'o:site_item_set' => array_merge($siteJson['o:site_item_set'] ?? [], $itemSets),
            ];
            $this->logger->debug(json_encode($updateData, JSON_PRETTY_PRINT));
            $this->logger->debug("Capture model $captureModel added to site $siteId");
            $this->api->update('sites', $siteId, $updateData, [], ['isPartial' => true]);
        } catch (\Throwable $e) {
            $this->logger->err('Unable to add capture model to site');
            $this->logger->err((string) $e);
        }
    }
}
