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
import { extractRevisionTextFields, stringBasedFields } from '../../../utility/extract-revision-text-fields';
import { parseMetadataListToValueMap } from '../../../utility/iiif-metadata';
import { parseUrn } from '../../../utility/parse-urn';
import { ProjectTemplate } from '../types';

type MetadataSuggestionsOptions = {
  bulkMetadata: string;
};

export const metadataSuggestions: ProjectTemplate<MetadataSuggestionsOptions> = {
  type: '@madoc.io/metadata-suggestions',
  metadata: {
    label: 'Metadata suggestions',
    description: 'Crowd source the metadata for your canvases or manifests',
    version: '1.0.0',
    thumbnail: `<svg width="109px" height="109px" viewBox="0 0 109 109" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
        <g transform="translate(-96.000000, -719.000000)">
            <g transform="translate(96.000000, 719.000000)">
                <rect stroke="#E7E9EC" stroke-width="2" x="1" y="1" width="107" height="107" rx="5"></rect>
                <rect fill="#BFBFBF" x="17" y="15" width="28" height="3"></rect>
                <rect fill="#E7E9EC" x="17" y="21" width="45" height="5"></rect>
                <rect fill="#5B78E5" x="17" y="21" width="45" height="5"></rect>
                <rect fill="#BFBFBF" x="17" y="32" width="28" height="3"></rect>
                <rect fill="#E7E9EC" x="17" y="38" width="39" height="5"></rect>
                <rect fill="#BFBFBF" x="17" y="49" width="28" height="3"></rect>
                <rect fill="#E7E9EC" x="17" y="55" width="33" height="5"></rect>
                <rect fill="#BFBFBF" x="17" y="66" width="28" height="3"></rect>
                <rect fill="#BFBFBF" x="17" y="83" width="28" height="3"></rect>
                <rect fill="#E7E9EC" x="17" y="72" width="41" height="5"></rect>
                <rect fill="#E7E9EC" x="17" y="89" width="39" height="5"></rect>
                <rect fill="#5B78E5" x="17" y="55" width="33" height="5"></rect>
                <rect fill="#5B78E5" x="17" y="89" width="39" height="5"></rect>
            </g>
        </g>
    </g>
</svg>`,
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
    },
    async beforeForkDocument(doc: any, { options }) {
      if (options.bulkMetadata) {
        const secondDoc = captureModelShorthandText(options.bulkMetadata);
        if (secondDoc) {
          Object.assign(doc.properties, secondDoc.properties);
        }
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
      const { stringValues, modified, langValues, keysFound, keyLabels } = extractRevisionTextFields(
        revision.document,
        revision.revision.id
      );

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
      const parsedMetadata = parseMetadataListToValueMap(fields);
      const { valueIndex, keysIndex } = parsedMetadata;

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
            const cursor = parsedMetadata.metadataCursor++;

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
            const cursor = parsedMetadata.metadataCursor++;

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
