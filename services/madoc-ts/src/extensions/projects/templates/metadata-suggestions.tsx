import React, { useMemo } from 'react';
import { TextFieldProps } from '../../../frontend/shared/capture-models/editor/input-types/TextField/TextField';
import { EditShorthandCaptureModel } from '../../../frontend/shared/capture-models/EditorShorthandCaptureModel';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { captureModelShorthandText } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { EditorSlots } from '../../../frontend/shared/capture-models/new/components/EditorSlots';
import { EmptyState } from '../../../frontend/shared/layout/EmptyState';
import { ProjectTemplate } from '../types';

type MetadataSuggestionsOptions = {
  bulkMetadata: string;
  allowCustomPairs: boolean;
};

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
};
