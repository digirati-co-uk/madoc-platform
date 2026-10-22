import type { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import type { TextFieldProps } from '../../../src/frontend/shared/capture-models/editor/input-types/TextField/TextField';
import {
  applyTranscriptionMetadata,
  getTranscriptionMetadata,
  updateTranscriptionTemplateConfig,
} from '../../../src/extensions/projects/transcription-metadata';

const baseField: TextFieldProps = {
  id: 'base-field',
  type: 'text-field',
  label: 'Old label',
  description: 'Old description',
  value: 'Original OCR',
  multiline: true,
};
const model: CaptureModel = {
  id: 'existing-canvas-model',
  derivedFrom: 'project-model',
  document: {
    id: 'document',
    type: 'entity',
    label: 'Form',
    instructions: 'Original document instructions',
    properties: {
      transcription: [
        baseField,
        {
          id: 'contributor-field',
          type: 'text-field',
          label: 'Old label',
          description: 'Old description',
          value: 'Corrected transcription',
          revises: 'base-field',
          revision: 'submitted-revision',
        },
      ],
      other: [{ id: 'other-field', type: 'text-field', label: 'Other', value: 'Unrelated value' }],
    },
  },
  structure: {
    id: 'choice',
    type: 'choice',
    label: 'Choose',
    items: [
      {
        id: 'view',
        type: 'model',
        label: 'Transcription',
        fields: ['transcription'],
        instructions: 'Original instructions',
      },
    ],
  },
  revisions: [
    { id: 'submitted-revision', status: 'submitted', fields: ['contributor-field'], authors: ['contributor'] },
  ],
};

it('reads current help from a legacy project without configuration', () => {
  expect(getTranscriptionMetadata(model, null)).toEqual({
    modelLabel: 'Old label',
    modelDescription: 'Old description',
    crowdsourcingInstructions: 'Original instructions',
  });
  expect(applyTranscriptionMetadata(model, null)).toBe(model);
});

it('updates or clears existing help without altering the loaded contribution or its identity', () => {
  const original = JSON.parse(JSON.stringify(model));
  const next = applyTranscriptionMetadata(model, {
    modelLabel: 'New label',
    modelDescription: '',
    crowdsourcingInstructions: '',
  });
  expect(getTranscriptionMetadata(next, undefined)).toEqual({
    modelLabel: 'New label',
    modelDescription: '',
    crowdsourcingInstructions: '',
  });
  expect(next.document.instructions).toBe('');
  expect(next.structure.type === 'choice' && next.structure.items[0]).toEqual({
    ...(model.structure.type === 'choice' ? model.structure.items[0] : {}),
    instructions: '',
  });
  expect(next.id).toBe(model.id);
  expect(next.derivedFrom).toBe(model.derivedFrom);
  expect(next.structure.id).toBe(model.structure.id);
  expect(next.document.id).toBe(model.document.id);
  expect(next.revisions).toBe(model.revisions);
  expect(next.document.properties.other).toBe(model.document.properties.other);
  expect(next.document.properties.transcription).toEqual(
    model.document.properties.transcription.map(field => ({
      ...field,
      label: 'New label',
      description: '',
    }))
  );
  expect(model).toEqual(original);
});

it('uses an explicit empty configuration value ahead of historic model metadata', () => {
  expect(getTranscriptionMetadata(model, { crowdsourcingInstructions: '', modelDescription: '' })).toEqual({
    modelLabel: 'Old label',
    modelDescription: '',
    crowdsourcingInstructions: '',
  });
  const next = applyTranscriptionMetadata(model, { modelDescription: 'New description' });
  expect(next.structure).toBe(model.structure);
  expect(next.document.instructions).toBe(model.document.instructions);
  expect(next.document.properties.transcription[1].description).toBe('New description');
});

it('retains unrelated configuration and rejects malformed legacy configuration rather than overwriting it', () => {
  const config = { reviewStrategy: 'manual', custom: { keep: true } };
  const metadata = { modelLabel: 'Transcription', modelDescription: '', crowdsourcingInstructions: '' };
  expect(updateTranscriptionTemplateConfig(config, metadata)).toEqual({ ...config, ...metadata });
  expect(config).toEqual({ reviewStrategy: 'manual', custom: { keep: true } });
  expect(updateTranscriptionTemplateConfig(null, metadata)).toEqual(metadata);
  expect(() => updateTranscriptionTemplateConfig('legacy', metadata)).toThrow('must be an object');
});
