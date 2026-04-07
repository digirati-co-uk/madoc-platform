import React from 'react';
import { useTranslation } from 'react-i18next';
import { MetadataEmptyState } from '../../../shared/atoms/MetadataConfiguration';
import { isEntity } from '../../../shared/capture-models/helpers/is-entity';
import { filterRevises } from '../../../shared/capture-models/helpers/filter-revises';
import { ViewDocument } from '../../../shared/capture-models/inspector/ViewDocument';
import type { CaptureModel } from '../../../shared/capture-models/types/capture-model';
import type { BaseField } from '../../../shared/capture-models/types/field-types';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { ModelDocumentIcon } from '../../../shared/icons/ModelDocumentIcon';
import {
  getTabularCellFlagKey,
  isTabularCellNote,
  parseTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
} from '../../../shared/utility/tabular-cell-flags';
import { useRouteContext } from '../use-route-context';
import type { CanvasMenuHook } from './types';

const TABULAR_DOCUMENT_NOTES_PROPERTY = 'tabularDocumentNotes';
const EMPTY_DOCUMENT_MESSAGE_MARGIN_TOP = 100;
const NOTE_PREFIX = 'Note:';

type DocumentPropertyValue = Array<CaptureModel['document'] | BaseField>;

function formatColumnKey(columnKey: string): string {
  const normalized = columnKey.replace(/[_-]+/g, ' ').trim();
  return normalized || columnKey;
}

function isBaseField(value: CaptureModel['document'] | BaseField): value is BaseField {
  return !isEntity(value);
}

function getDocumentPropertyValues(document: CaptureModel['document']): DocumentPropertyValue[] {
  return Object.values(document.properties).filter(Array.isArray) as DocumentPropertyValue[];
}

function hasFieldValue(field: BaseField): boolean {
  return typeof field.value !== 'undefined';
}

function hasDefinedValueInDocument(document: CaptureModel['document']): boolean {
  const propertyValues = getDocumentPropertyValues(document);
  const topLevelItems = propertyValues.flat();
  const hasTopLevelValue = topLevelItems.some(item => isBaseField(item) && hasFieldValue(item));
  if (hasTopLevelValue) {
    return true;
  }

  return topLevelItems.some(item => {
    if (isBaseField(item)) {
      return false;
    }

    return getDocumentPropertyValues(item)
      .flat()
      .some(nestedItem => isBaseField(nestedItem) && hasFieldValue(nestedItem));
  });
}

function hasApprovedRevision(model: CaptureModel): boolean {
  return (model.revisions || []).some(revision => revision.approved);
}

function isValidDocumentModel(model: CaptureModel): boolean {
  const propertyValues = getDocumentPropertyValues(model.document);
  if (!propertyValues.length) {
    return false;
  }

  return hasApprovedRevision(model) && hasDefinedValueInDocument(model.document);
}

function getTabularDocumentNoteFields(document: CaptureModel['document']): BaseField[] {
  const rawFlags = document.properties[TABULAR_CELL_FLAGS_PROPERTY];
  if (!Array.isArray(rawFlags)) {
    return [];
  }

  const allFlagFields = (rawFlags as Array<CaptureModel['document'] | BaseField>).filter(isBaseField);
  if (!allFlagFields.length) {
    return [];
  }

  const visibleFlagFields = filterRevises(allFlagFields);
  const mergedNotes = new Map<
    string,
    {
      rowIndex: number;
      columnKey: string;
      comment?: string;
    }
  >();

  for (const flagsField of visibleFlagFields) {
    for (const flag of Object.values(parseTabularCellFlags(flagsField.value))) {
      if (!isTabularCellNote(flag)) {
        continue;
      }
      mergedNotes.set(getTabularCellFlagKey(flag.rowIndex, flag.columnKey), {
        rowIndex: flag.rowIndex,
        columnKey: flag.columnKey,
        comment: flag.comment,
      });
    }
  }

  return Array.from(mergedNotes.values())
    .sort((left, right) => {
      if (left.rowIndex !== right.rowIndex) {
        return left.rowIndex - right.rowIndex;
      }
      return left.columnKey.localeCompare(right.columnKey);
    })
    .map(note => {
      const noteComment = note.comment?.trim() ? note.comment.trim() : '';
      return {
        id: `${document.id}-tabular-note-row-${note.rowIndex}-col-${note.columnKey}`,
        type: 'text-field',
        label: `Row ${note.rowIndex + 1}, ${formatColumnKey(note.columnKey)}`,
        value: noteComment ? `${NOTE_PREFIX} ${noteComment}` : NOTE_PREFIX,
      } satisfies BaseField;
    });
}

function withoutTabularSystemProperties(document: CaptureModel['document']): CaptureModel['document'] {
  if (!Object.prototype.hasOwnProperty.call(document.properties, TABULAR_CELL_FLAGS_PROPERTY)) {
    return document;
  }

  const { [TABULAR_CELL_FLAGS_PROPERTY]: _ignored, ...properties } = document.properties;
  return {
    ...document,
    properties,
  };
}

function withTabularDocumentNotes(document: CaptureModel['document']): CaptureModel['document'] {
  const cleanedDocument = withoutTabularSystemProperties(document);
  const noteFields = getTabularDocumentNoteFields(document);
  if (!noteFields.length) {
    return cleanedDocument;
  }

  return {
    ...cleanedDocument,
    properties: {
      ...cleanedDocument.properties,
      [TABULAR_DOCUMENT_NOTES_PROPERTY]: noteFields,
    },
  };
}

export function useDocumentPanel(): CanvasMenuHook {
  const { projectId, canvasId } = useRouteContext();
  const { data, isLoading } = apiHooks.getSiteCanvasPublishedModels(
    () =>
      canvasId ? [canvasId, { project_id: projectId, selectors: true, format: 'capture-model-with-pages' }] : undefined,
    { refetchOnWindowFocus: false }
  );
  const { t } = useTranslation();
  const canvas = data?.canvas;

  const modelsWithTabularNotes = data?.models
    ? data.models.map((model: CaptureModel) => ({
        ...model,
        document: withTabularDocumentNotes(model.document),
      }))
    : [];

  const validModels = modelsWithTabularNotes.filter(isValidDocumentModel);
  const showNoDocumentMessage = !!projectId && ((!!data && !validModels.length) || (!data && !isLoading));

  const content = (
    <>
      {data && validModels.length
        ? validModels.map((model: CaptureModel) => {
            const incompleteRevisions = (model.revisions || []).filter(rev => !rev.approved).map(rev => rev.id);
            return (
              <ViewDocument hideEmpty key={model.id} document={model.document} filterRevisions={incompleteRevisions} />
            );
          })
        : null}
      {showNoDocumentMessage ? (
        <MetadataEmptyState style={{ marginTop: EMPTY_DOCUMENT_MESSAGE_MARGIN_TOP }}>
          {t('No document yet')}
        </MetadataEmptyState>
      ) : null}
    </>
  );

  return {
    id: 'document',
    label: t('Document'),
    icon: <ModelDocumentIcon />,
    isLoaded: !!canvas,
    notifications: validModels.length,
    content,
  };
}
