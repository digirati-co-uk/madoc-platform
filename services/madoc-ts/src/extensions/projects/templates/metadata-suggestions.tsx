import { InternationalString } from '@hyperion-framework/types';
import React, { useMemo } from 'react';
import invariant from 'tiny-invariant';
import { TextFieldProps } from '../../../frontend/shared/capture-models/editor/input-types/TextField/TextField';
import { EditShorthandCaptureModel } from '../../../frontend/shared/capture-models/EditorShorthandCaptureModel';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { captureModelShorthandText } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { traverseDocument } from '../../../frontend/shared/capture-models/helpers/traverse-document';
import { EditorSlots } from '../../../frontend/shared/capture-models/new/components/EditorSlots';
import { MetadataDiff } from '../../../frontend/shared/hooks/use-metadata-editor';
import { EmptyState } from '../../../frontend/shared/layout/EmptyState';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { MetadataField } from '../../../utility/iiif-metadata';
import { parseUrn } from '../../../utility/parse-urn';
import { ProjectTemplate } from '../types';

type MetadataSuggestionsOptions = {
  bulkMetadata: string;
  allowCustomPairs: boolean;
};

const stringBasedFields = ['text-field', 'dropdown-field', 'tagged-text-field', 'html-field', 'color-field'];

export const metadataSuggestions: ProjectTemplate<MetadataSuggestionsOptions> = {
  type: '@madoc.io/metadata-suggestions',
  metadata: {
    label: 'Metadata suggestions',
    description: 'Crowd source the metadata for your canvases or manifests',
    version: '1.0.0',
  },
  captureModel: {
    document: captureModelShorthand({}),
  },
  configuration: {
    defaults: {
      allowManifestNavigation: true,
      allowCanvasNavigation: true,
      allowSubmissionsWhenCanvasComplete: false,
      contributionMode: 'annotation',
      defaultEditorOrientation: 'horizontal',

      claimGranularity: 'canvas', // well.. no not really.
      reviewOptions: {
        allowMerging: false,
      },
      modelPageOptions: {
        fixedTranscriptionBar: false,
        preventContributionAfterRejection: false,
        preventContributionAfterSubmission: true,
        preventMultipleUserSubmissionsPerResource: true,
        preventContributionAfterManifestUnassign: false,
        hideViewerControls: false,
      },
      projectPageOptions: {
        hideStartContributing: false,
        hideSearchButton: false,
        hideRandomManifest: false,
        hideRandomCanvas: false,
      },
      manifestPageOptions: {
        hideStartContributing: false,
        hideOpenInMirador: false,
        hideSearchButton: false,
        hideRandomCanvas: false,
        hideFilterImages: false,
        directModelPage: false,
        coveredImages: true,
        hideCanvasLabels: true,
        showIIIFLogo: true,
      },
      headerOptions: {
        hideSiteTitle: false,
        hideProjectsLink: false,
        hideCollectionsLink: false,
        hideDashboardLink: false,
        hidePageNavLinks: false,
        hideSearchBar: false,
      },
      searchOptions: {
        nonLatinFulltext: false,
        searchMultipleFields: false,
        onlyShowManifests: true,
      },
      activityStreams: {
        manifest: true,
        canvas: false,
        curated: true,
        published: false,
      },
      metadataSuggestions: {
        collection: false,
        manifest: true,
        canvas: false,
      },
      shadow: {
        showCaptureModelOnManifest: true,
      },
    },
  },
  setup: {
    model: {
      bulkMetadata: {
        type: 'text-field',
        label: 'Bulk metadata fields',
        multiline: true,
        minLines: 10,
      } as Partial<TextFieldProps>,
      allowCustomPairs: {
        type: 'checkbox-field',
        label: 'Populate existing metadata values',
      },
    },
    modelPreview: function ModelPreview(options) {
      const doc = useMemo(() => {
        return captureModelShorthandText(options.bulkMetadata);
      }, [options.bulkMetadata]);

      if (!options.bulkMetadata) {
        return (
          <div>
            <EmptyState>No model to preview</EmptyState>
          </div>
        );
      }

      return (
        <div>
          <EditShorthandCaptureModel template={doc} fullDocument={!!doc} keepExtraFields>
            <EditorSlots.TopLevelEditor />
          </EditShorthandCaptureModel>
        </div>
      );
    },
    defaults: {
      bulkMetadata: '',
      allowCustomPairs: false,
    },
    async beforeForkDocument(doc: any, { options }) {
      if (options.bulkMetadata) {
        const secondDoc = captureModelShorthandText(options.bulkMetadata);
        if (secondDoc) {
          Object.assign(doc.properties, secondDoc.properties);
        }
      }

      if (options.allowCustomPairs) {
        const custom = captureModelShorthand({
          label: { type: 'international-field', label: 'Label', value: [{ none: '' }] },
          value: { type: 'international-field', label: 'Value', value: [{ none: '' }] },
        });
        custom.allowMultiple = true;
        custom.label = 'Custom metadata';
        custom.labelledBy = `{label} - {value}`;
        doc.properties.customMetadata = [custom];
      }

      return doc;
    },
  },
  customConfig: {
    replacesProjectConfig: false,
    model: {
      populateExisting: { type: 'checkbox-field', label: 'Populate existing metadata values' },
      populateAllMetadataValues: { type: 'checkbox-field', label: 'Populate missing fields' },
    },
    async applyConfig(config, prev) {
      //
    },
    defaults: {
      populateExising: true,
      populateAllMetadataValues: false,
    },
  },
  hooks: {
    async beforeCloneModel({ captureModel, api }) {
      const { manifest } = await api.getManifestByCaptureModel(captureModel);

      invariant(manifest.metadata, 'Missing or invalid manifest ID');
      invariant(captureModel.id);

      // 2. Find Metadata values, and assign them to the capture model.

      const mappingValue: Record<string, string> = {};
      const mappingIntl: Record<string, InternationalString> = {};

      for (const metadata of manifest.metadata) {
        if (metadata.label && metadata.value) {
          const labels = Object.entries(metadata.label);
          for (const [, labelParts] of labels) {
            if (labelParts) {
              const key = labelParts.join('').toLowerCase();
              mappingIntl[key] = metadata.value;
              for (const [, value] of Object.entries(metadata.value)) {
                if (value) {
                  mappingValue[key] = value.join('');
                }
              }
            }
          }
        }
      }

      let modified = false;

      traverseDocument(captureModel.document, {
        visitField: (field, key_) => {
          const key = key_.toLowerCase();
          if (key && mappingIntl[key] && field.type === 'international-field') {
            field.value = mappingIntl[key];
            modified = true;
            return;
          }

          if (key && mappingValue[key] && stringBasedFields.indexOf(field.type) !== -1) {
            field.value = mappingValue[key];
            modified = true;
            return;
          }
        },
      });

      if (modified) {
        try {
          await api.updateCaptureModel(captureModel.id, captureModel);
        } catch (e) {
          // no-op on error.
          console.log('[Metadata suggestions]: Error saving capture model beforeCloneModel', e);
        }
      }
    },

    async onRevisionApproved({ revision, captureModel, api }) {
      let modified = false;
      const keysFound: string[] = [];
      const stringValues: Record<string, string> = {};
      const langValues: Record<string, InternationalString> = {};
      const keyLabels: Record<string, string> = {};
      // 1) Extract revision fields.

      traverseDocument(revision.document, {
        visitField(field, key_) {
          if (field.revision === revision.revision.id) {
            // Only apply changes made in this revision.
            const key = key_.toLowerCase();
            keyLabels[key] = field.label || key_;
            if (key && field.type === 'international-field') {
              keysFound.push(key);
              langValues[key] = field.value;
              modified = true;
              return;
            }

            if (key && stringBasedFields.indexOf(field.type) !== -1) {
              keysFound.push(key);
              stringValues[key] = field.value;
              modified = true;
              return;
            }
          }
        },
      });

      // Nothing to do
      if (!modified) {
        return;
      }

      // 2) Get manifest metadata
      const target = captureModel.target?.find(t => t.type.toLowerCase() === 'manifest');

      invariant(captureModel.id, 'Missing capture model id');
      invariant(target, 'Missing target on model');

      const manifestUrn = parseUrn(target.id);

      invariant(manifestUrn, 'Missing or invalid manifest ID');

      const { fields } = await api.getManifestMetadata(manifestUrn.id);

      const keysIndex: Record<string, number> = {};
      const valueIndex: Record<number, Array<MetadataDefinition & { id: number }>> = {};
      let metadataCursor = 0;

      for (const field of fields) {
        if (field.key.startsWith('metadata.') && field.key.endsWith('.label')) {
          const [, index] = field.key.split('.');
          const keyToStore = field.value.toLowerCase();
          keysIndex[keyToStore] = Number(index);

          metadataCursor = Math.max(metadataCursor, Number(index));
        }
        if (field.key.startsWith('metadata.') && field.key.endsWith('.value')) {
          const [, index] = field.key.split('.');
          const numberIndex = Number(index);
          valueIndex[numberIndex] = valueIndex[numberIndex] ? valueIndex[numberIndex] : [];
          valueIndex[numberIndex].push(field);
          metadataCursor = Math.max(metadataCursor, numberIndex);
        }
      }

      metadataCursor++;

      const fullDiff: MetadataDiff = {
        added: [],
        modified: [],
        removed: [],
      };

      for (const keyFound of keysFound) {
        const stringValue = stringValues[keyFound];
        const langValue = langValues[keyFound];
        // Try lang first.
        if (langValue && keysIndex[keyFound]) {
          const idx = keysIndex[keyFound];
          const values = valueIndex[idx];
          if (values && values.length) {
            const allLangs = Object.keys(langValue);
            const replacedLangs = [];

            for (const value of values) {
              // Removed.
              if (allLangs.indexOf(value.language) === -1) {
                fullDiff.removed.push(value.id);
                continue;
              }

              // Replaced
              const langStrs = langValue[value.language];
              if ((langStrs && langStrs.length > 1) || values.length > 1) {
                // De-optimise and delete all languages.
                replacedLangs.push(value.language);
                fullDiff.removed.push(value.id);
                continue;
              }

              // Updated.
              const firstAndOnly = values[0];
              if (langStrs && firstAndOnly && firstAndOnly.value !== langStrs[0]) {
                fullDiff.modified.push({
                  ...firstAndOnly,
                  value: langStrs[0],
                });
              }
            }

            for (const replacedLang of replacedLangs) {
              const langStrs = langValue[replacedLang];
              if (langStrs) {
                for (const value of langStrs) {
                  fullDiff.added.push({
                    key: `metadata.${idx}.value`,
                    value,
                    language: replacedLang,
                  });
                }
              }
            }
          }
          continue;
        } else {
          if (langValue) {
            // Creating.
            const cursor = metadataCursor++;

            fullDiff.added.push({
              key: `metadata.${cursor}.label`,
              value: keyLabels[keyFound] || keyFound,
              language: 'none',
            });

            const allLangs = Object.keys(langValue);
            for (const lang of allLangs) {
              for (const value of langValue[lang] || []) {
                fullDiff.added.push({
                  key: `metadata.${cursor}.value`,
                  value: value,
                  language: lang,
                });
              }
            }
            continue;
          }
        }

        if (typeof stringValue !== 'undefined') {
          // Updating
          if (typeof keysIndex[keyFound] !== 'undefined') {
            const idx = keysIndex[keyFound];
            const values = valueIndex[idx];
            const theOneWeKeep = values[0];

            if (values.length > 1) {
              const valuesToRemove = values.slice(1);
              for (const valueToRemove of valuesToRemove) {
                fullDiff.removed.push(valueToRemove.id);
              }
            }

            fullDiff.modified.push({
              ...theOneWeKeep,
              value: stringValue,
            });
          }
        } else {
          if (stringValue) {
            // Creating.
            const cursor = metadataCursor++;

            fullDiff.added.push({
              key: `metadata.${cursor}.label`,
              value: keyLabels[keyFound] || keyFound,
              language: 'none',
            });

            fullDiff.added.push({
              key: `metadata.${cursor}.value`,
              value: stringValue,
              language: 'none',
            });
          }
        }
      }

      if (fullDiff.removed.length || fullDiff.added.length || fullDiff.modified.length) {
        await api.updateManifestMetadata(manifestUrn.id, fullDiff);
      }
    },
  },
};
