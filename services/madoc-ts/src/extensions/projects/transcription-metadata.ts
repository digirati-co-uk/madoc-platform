import type { CaptureModel, Document } from '../../frontend/shared/capture-models/types/capture-model';
import type { BaseField } from '../../frontend/shared/capture-models/types/field-types';

export interface TranscriptionMetadata {
  modelLabel: string;
  modelDescription: string;
  crowdsourcingInstructions: string;
}

function asConfig(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function isFieldList(fields: Array<BaseField | Document>): fields is BaseField[] {
  return fields.every(field => field.type !== 'entity');
}

function structureInstructions(structure: CaptureModel['structure']): string {
  return structure.type === 'model'
    ? structure.instructions || ''
    : structure.items.map(structureInstructions).find(text => text.trim()) || '';
}

export function getTranscriptionMetadata(model: CaptureModel, templateConfig: unknown): TranscriptionMetadata {
  const config = asConfig(templateConfig);
  const field = model.document.properties.transcription?.[0];
  return {
    modelLabel: typeof config.modelLabel === 'string' ? config.modelLabel : field?.label || 'Transcription',
    modelDescription: typeof config.modelDescription === 'string' ? config.modelDescription : field?.description || '',
    crowdsourcingInstructions:
      typeof config.crowdsourcingInstructions === 'string'
        ? config.crowdsourcingInstructions
        : structureInstructions(model.structure) || model.document.instructions || '',
  };
}

export function updateTranscriptionTemplateConfig(
  config: unknown,
  metadata: TranscriptionMetadata
): Record<string, unknown> {
  if (config != null && (typeof config !== 'object' || Array.isArray(config))) {
    throw new Error('Project template configuration must be an object');
  }
  return { ...asConfig(config), ...metadata };
}

/** Display current project help even on older contributions; never mutate the loaded model. */
export function applyTranscriptionMetadata(model: CaptureModel, templateConfig: unknown): CaptureModel {
  const config = asConfig(templateConfig);
  const hasInstructions = typeof config.crowdsourcingInstructions === 'string';
  const hasLabel = typeof config.modelLabel === 'string';
  const hasDescription = typeof config.modelDescription === 'string';
  if (!hasInstructions && !hasLabel && !hasDescription) return model;
  const metadata = getTranscriptionMetadata(model, config);
  const overlayStructure = (structure: CaptureModel['structure']): CaptureModel['structure'] =>
    structure.type === 'model'
      ? { ...structure, instructions: metadata.crowdsourcingInstructions }
      : { ...structure, items: structure.items.map(overlayStructure) };
  const fields = model.document.properties.transcription;
  return {
    ...model,
    structure: hasInstructions ? overlayStructure(model.structure) : model.structure,
    document: {
      ...model.document,
      ...(hasInstructions ? { instructions: metadata.crowdsourcingInstructions } : {}),
      properties: {
        ...model.document.properties,
        ...(fields && isFieldList(fields)
          ? {
              transcription: fields.map(field => ({
                ...field,
                ...(hasLabel ? { label: metadata.modelLabel } : {}),
                ...(hasDescription ? { description: metadata.modelDescription } : {}),
              })),
            }
          : {}),
      },
    },
  };
}
