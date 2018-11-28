<?php

namespace ResourceProvider;

use Doctrine\DBAL\Connection;
use Exception;
use Omeka\Module\AbstractModule;
use Omeka\Module\Exception\ModuleCannotInstallException;
use Omeka\Stdlib\RdfImporter;
use Throwable;
use Zend\ModuleManager\ModuleEvent;
use Zend\ModuleManager\ModuleManager;
use Zend\ServiceManager\ServiceLocatorInterface;

class Module extends AbstractModule
{
    public function getConfig()
    {
        return [];
    }

    public function install(ServiceLocatorInterface $services)
    {
        /** @var RdfImporter $importer */
        $importer = $services->get('Omeka\RdfImporter');
        /** @var Connection $connection */
        $connection = $services->get('Omeka\Connection');

        try {
            $this->importCrowdsVocabulary($importer);
            $this->importMadocVocabulary($importer);
            $this->importRdfsVocabulary($importer);
        } catch (ModuleCannotInstallException $e) {
            throw new ModuleCannotInstallException(sprintf('Failed to install module: %s', $e->getMessage()));
        } catch (Exception $e) {
            throw new ModuleCannotInstallException($e->getMessage());
        }

        $this->importCrowdSourceElementTemplate($connection);
        $this->importCrowdSourceGroupTemplate($connection);

        return true;
    }

    protected function importCrowdsVocabulary(RdfImporter $importer)
    {
        try {
            $importer->import(
                'file',
                [
                    'o:prefix' => 'crowds',
                    'o:namespace_uri' => 'http://www.digirati.com/ns/crowds',
                    'o:label' => 'Crowds: Crowd Source Vocabulary for defining capture models.',
                    'o:comment' => 'Crowds: Crowd Source Vocabulary for defining capture models ',
                    'file' => __DIR__.'/data/crowds.rdf',
                ],
                [
                    'file' => __DIR__.'/data/crowds.rdf',
                ]
            );
        } catch (Throwable $e) {
            throw new ModuleCannotInstallException('failed to import Crowd Vocabulary: '.$e->getMessage());
        }
    }

    protected function importMadocVocabulary(RdfImporter $importer)
    {
        try {
            $importer->import(
                'file',
                [
                    'o:prefix' => 'madoc',
                    'o:namespace_uri' => 'http://www.digirati.com/ns/madoc',
                    'o:label' => 'Madoc: Crowd Source Vocabulary for rendering UI',
                    'o:comment' => 'Madoc: Crowd Source Vocabulary for rendering UI',
                    'file' => __DIR__.'/data/madoc.rdf',
                ],
                [
                    'file' => __DIR__.'/data/madoc.rdf',
                ]
            );
        } catch (Throwable $e) {
            throw new ModuleCannotInstallException('failed to import Madoc Vocabulary: '.$e->getMessage());
        }
    }

    protected function importRdfsVocabulary(RdfImporter $importer)
    {
        try {
            $importer->import(
                'file',
                [
                    'o:prefix' => 'rdfs',
                    'o:namespace_uri' => 'http://www.w3.org/2000/01/rdf-schema',
                    'o:label' => 'The RDF Schema vocabulary (RDFS)',
                    'o:comment' => 'The RDF Schema vocabulary (RDFS)',
                    'file' => __DIR__.'/data/rdfs.rdf',
                ],
                [
                    'file' => __DIR__.'/data/rdfs.rdf',
                ]
            );
        } catch (Throwable $e) {
            throw new ModuleCannotInstallException('failed to import RDFS Vocabulary: '.$e->getMessage());
        }
    }

    protected function importCrowdSourceElementTemplate($connection)
    {
        $templateName = 'Crowd Source Element';
        $templateSql = $this->getBaseResourceTemplateSql();
        $templatePropertySql = $this->getBaseResourceTemplatePropertySql();

        $connection->exec(sprintf($templateSql, 'InteractiveResource', 'dctype', $templateName));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'title', 1, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'rdfs', 'label', 2, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'description', 3, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'rdfs', 'range', 4, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'conformsTo', 5, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiSelectorType', 6, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiInputType', 7, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoBodyPurpose', 8, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoBodyFormat', 9, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoBodyType', 10, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoMotivatedBy', 11, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'isPartOf', 12, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiHidden', 13, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiFormGroup', 14, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiInputDefaultValue', 15, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiInputOptions', 16, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiRequired', 17, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiSelectorValue', 18, false));
    }

    protected function importCrowdSourceGroupTemplate($connection)
    {
        $templateName = 'Crowd Source Group';
        $templateSql = $this->getBaseResourceTemplateSql();
        $templatePropertySql = $this->getBaseResourceTemplatePropertySql();

        $connection->exec(sprintf($templateSql, 'InteractiveResource', 'dctype', $templateName));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'title', 1, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'rdfs', 'label', 2, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'description', 3, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'rdfs', 'range', 4, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'conformsTo', 5, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'hasPart', 6, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiGroup', 7, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiChoice', 8, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiMultiple', 9, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoCombine', 10, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoExternalize', 11, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoSerialize', 12, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoHumanReadable', 13, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoBodyLabelParts', 14, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiSelectorType', 15, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'derivedAnnoMotivatedBy', 16, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'dcterms', 'isPartOf', 17, false));
        $connection->exec(sprintf($templatePropertySql, $templateName, 'crowds', 'uiComponent', 18, false));
    }

    protected function getBaseResourceTemplateSql()
    {
        return '
            INSERT INTO `resource_template`
                SET `resource_class_id` = (
                    SELECT `rc`.`id`
                    FROM `resource_class` `rc`
                    INNER JOIN `vocabulary` `v` ON `rc`.`vocabulary_id` = `v`.`id`
                    WHERE `rc`.`local_name` = "%1$s"
                        AND `v`.`prefix` = "%2$s"
                ), 
                `label` = "%3$s"
            ;
        ';
    }

    protected function getBaseResourceTemplatePropertySql()
    {
        return '
            INSERT INTO `resource_template_property`
            SET `resource_template_id` = (
                    SELECT `rt`.`id`
                    FROM `resource_template` `rt`
                    WHERE `rt`.`label` = "%1$s"
                ),
                `property_id` = (
                    SELECT `p`.`id`
                    FROM `property` `p`
                    INNER JOIN `vocabulary` `v` ON `p`.`vocabulary_id` = `v`.`id`
                    WHERE `v`.`prefix` = "%2$s"
                      AND `p`.`local_name` = "%3$s"
                ),
                `alternate_label` = NULL,
                `alternate_comment` = NULL,
                `position` = %4$d,
                `data_type` = NULL,
                `is_required` = %5$d
            ;
        ';
    }

    public function init(ModuleManager $moduleManager)
    {
        $events = $moduleManager->getEventManager();

        // Registering a listener at default priority, 1, which will trigger
        // after the ConfigListener merges config.
        $events->attach(ModuleEvent::EVENT_MERGE_CONFIG, array($this, 'onMergeConfig'));
    }

    public function onMergeConfig(ModuleEvent $e)
    {
        $configListener = $e->getConfigListener();
        $config = $configListener->getMergedConfig(false);

        // Modify the configuration; here, we'll remove a specific key:
        if (isset($config['navigation']['AdminResource'])) {
            foreach ($config['navigation']['AdminResource'] as &$adminResource) {
                if (
                    $adminResource['class'] === 'items' &&
                    $adminResource['controller'] === 'item' &&
                    $adminResource['action'] === 'browse'
                ) {
                    $adminResource['pages'][] = [
                        'label' => 'Capture model fields', // @translate
                        'route' => 'admin/default',
                        'controller' => 'item',
                        'visible' => true,
                        'action' => '',
                        'resource' => 'Omeka\Controller\Admin\Item',
                        'privilege' => 'browse',
                        'query' => ['resource_class_id' => 27] // @todo find way to dynamically do this at the config point.
                    ];
                }
                if (
                    $adminResource['class'] === 'item-sets' &&
                    $adminResource['controller'] === 'item-set' &&
                    $adminResource['action'] === 'browse'
                ) {
                    $adminResource['pages'][] = [
                        'label' => 'Capture models', // @translate
                        'route' => 'admin/default',
                        'controller' => 'item-set',
                        'visible' => true,
                        'action' => '',
                        'resource' => 'Omeka\Controller\Admin\ItemSet',
                        'privilege' => 'browse',
                        'query' => ['resource_class_id' => 27] // @todo find way to dynamically do this at the config point.
                    ];
                }
            }
        }

        // Pass the changed configuration back to the listener:
        $configListener->setMergedConfig($config);
    }
}
