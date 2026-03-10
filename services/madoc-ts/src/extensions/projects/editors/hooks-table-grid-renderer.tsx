import React, { useMemo } from 'react';
import { DataGrid, type Column } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { ModalButton } from '../../../frontend/shared/components/Modal';
import { type CaptureModelEditorApi } from '../../../frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';
import { type TopLevelFieldRef } from '../../../frontend/shared/capture-models/new/utility/table-editor-api';
import { Button } from '../../../frontend/shared/navigation/Button';
import { usePersonalNotesMenu } from '../../../frontend/site/hooks/canvas-menu/personal-notes';
import {
  hooksTableTestingRowFieldMap,
  hooksTableTestingTopLevelFieldMap,
  type HooksTableAutocompleteField,
  type HooksTableFieldDefinition,
} from '../templates/hooks-table-testing-fields';
import { isTabularSystemProperty } from './tabular-project-custom-editor-utils';

type HooksTableMode = 'read' | 'write';

type HooksTableGridRendererProps = {
  table: CaptureModelEditorApi;
  mode: HooksTableMode;
  disabled?: boolean;
};

type HooksTableGridRow = {
  id: string;
  rowIndex: number;
  row: CaptureModelEditorApi['rows'][number];
  values: Record<string, unknown>;
};

function getAutocompleteLabel(value: unknown): string {
  if (value && typeof value === 'object') {
    const candidate = value as { label?: unknown; uri?: unknown };
    if (typeof candidate.label === 'string' && candidate.label) {
      return candidate.label;
    }
    if (typeof candidate.uri === 'string' && candidate.uri) {
      return candidate.uri;
    }
  }

  return typeof value === 'string' ? value : '';
}

function toAutocompleteValue(input: string, definition: HooksTableAutocompleteField) {
  const trimmed = input.trim();

  if (!trimmed) {
    return undefined;
  }

  const staticMatch = definition.staticOptions.find(
    option =>
      option.uri.toLowerCase() === trimmed.toLowerCase() ||
      (typeof option.label === 'string' && option.label.toLowerCase() === trimmed.toLowerCase())
  );

  if (staticMatch) {
    return {
      uri: staticMatch.uri,
      label: typeof staticMatch.label === 'string' ? staticMatch.label : staticMatch.uri,
      resource_class: staticMatch.resource_class,
    };
  }

  return {
    uri: trimmed,
    label: trimmed,
  };
}

function formatFieldValue(value: unknown, definition?: HooksTableFieldDefinition): string {
  if (definition?.type === 'checkbox-field') {
    return value ? 'Yes' : 'No';
  }

  if (definition?.type === 'dropdown-field') {
    const dropdownValue = typeof value === 'string' ? value : undefined;
    if (!dropdownValue) {
      return '-';
    }

    const option = definition.options.find(candidate => candidate.value === dropdownValue);
    return option ? option.text : dropdownValue;
  }

  if (definition?.type === 'autocomplete-field') {
    const text = getAutocompleteLabel(value);
    if (!text) {
      return '-';
    }

    const uri =
      value && typeof value === 'object' && typeof (value as { uri?: unknown }).uri === 'string'
        ? ((value as { uri: string }).uri as string)
        : undefined;

    return uri && uri !== text ? `${text} (${uri})` : text;
  }

  if (typeof value === 'string') {
    return value || '-';
  }

  if (value === null || typeof value === 'undefined') {
    return '-';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
}

function renderEditableField(options: {
  definition?: HooksTableFieldDefinition;
  value: unknown;
  onChange: (next: unknown) => void;
  inputId: string;
  disabled: boolean;
}) {
  const { definition, value, onChange, inputId, disabled } = options;

  if (definition?.type === 'dropdown-field') {
    const selectedValue = typeof value === 'string' ? value : '';

    return (
      <select
        id={inputId}
        className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
        value={selectedValue}
        disabled={disabled}
        onChange={event => {
          const nextValue = event.target.value;
          onChange(nextValue || undefined);
        }}
      >
        <option value="">{definition.placeholder || 'Select option'}</option>
        {definition.options.map(option => (
          <option key={`${option.value}-${option.text}`} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    );
  }

  if (definition?.type === 'autocomplete-field') {
    const listId = `${inputId}-list`;

    return (
      <>
        <input
          id={inputId}
          list={listId}
          className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          value={getAutocompleteLabel(value)}
          disabled={disabled}
          placeholder={definition.placeholder || 'Search'}
          onChange={event => {
            onChange(toAutocompleteValue(event.target.value, definition));
          }}
        />
        <datalist id={listId}>
          {definition.staticOptions.map(option => (
            <option
              key={`${option.uri}-${String(option.label)}`}
              value={typeof option.label === 'string' ? option.label : option.uri}
              label={option.uri}
            />
          ))}
        </datalist>
      </>
    );
  }

  if (definition?.type === 'checkbox-field') {
    return (
      <div className="flex h-full items-center justify-center">
        <input
          id={inputId}
          type="checkbox"
          checked={!!value}
          disabled={disabled}
          onChange={event => onChange(event.target.checked)}
        />
      </div>
    );
  }

  return (
    <input
      id={inputId}
      className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
      value={typeof value === 'string' ? value : value === null || typeof value === 'undefined' ? '' : String(value)}
      disabled={disabled}
      onChange={event => onChange(event.target.value)}
    />
  );
}

function renderTopLevelField(options: {
  definition?: HooksTableFieldDefinition;
  field: TopLevelFieldRef;
  mode: HooksTableMode;
  disabled: boolean;
  inputId: string;
}) {
  const { definition, field, mode, disabled, inputId } = options;

  if (mode === 'read') {
    return (
      <div className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-sm">
        {formatFieldValue(field.value, definition)}
      </div>
    );
  }

  if (definition?.type === 'text-field' && definition.multiline) {
    return (
      <textarea
        id={inputId}
        className="min-h-24 w-full rounded border border-gray-300 p-2 text-sm"
        rows={definition.minLines || 3}
        value={
          typeof field.value === 'string'
            ? field.value
            : field.value === null || typeof field.value === 'undefined'
              ? ''
              : String(field.value)
        }
        disabled={disabled}
        onChange={event => field.setValue(event.target.value)}
      />
    );
  }

  return renderEditableField({
    definition,
    value: field.value,
    onChange: field.setValue,
    inputId,
    disabled,
  });
}

export function HooksTableTopLevelFieldsModalButton({
  table,
  mode,
  disabled,
}: {
  table: CaptureModelEditorApi;
  mode: HooksTableMode;
  disabled?: boolean;
}) {
  const properties = useMemo(() => {
    const known = Object.keys(hooksTableTestingTopLevelFieldMap).filter(
      property => !!table.topLevelFields[property] && !isTabularSystemProperty(property)
    );
    const unknown = Object.keys(table.topLevelFields).filter(
      property => !hooksTableTestingTopLevelFieldMap[property] && !isTabularSystemProperty(property)
    );

    return [...known, ...unknown];
  }, [table.topLevelFields]);

  return (
    <ModalButton
      as={Button}
      title="Extra fields"
      disabled={disabled}
      modalSize="lg"
      render={() => {
        return (
          <div className="flex flex-col gap-4">
            {!properties.length ? <div>No extra fields configured.</div> : null}
            {properties.map(property => {
              const definition = hooksTableTestingTopLevelFieldMap[property];
              const fields = table.topLevelFields[property] || [];

              return (
                <div key={property} className="flex flex-col gap-2">
                  <div className="text-sm font-semibold">{definition?.label || property}</div>
                  {fields.map((field, index) => (
                    <div key={`${property}-${field.fieldId || index}`} className="flex flex-col gap-1">
                      {renderTopLevelField({
                        definition,
                        field,
                        mode,
                        disabled: !!disabled || mode === 'read',
                        inputId: `hooks-table-top-level-${property}-${index}`,
                      })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        );
      }}
      renderFooter={({ close }) => (
        <div className="flex justify-end">
          <Button onClick={close}>Close</Button>
        </div>
      )}
    >
      Extra fields
    </ModalButton>
  );
}

export function HooksTablePersonalNotesModalButton({ disabled }: { disabled?: boolean }) {
  const personalNotesPanel = usePersonalNotesMenu();
  const label = personalNotesPanel.label || 'Personal notes';
  const notifications = personalNotesPanel.notifications;
  const buttonLabel = notifications ? `${label} (${notifications})` : label;

  if (personalNotesPanel.isHidden) {
    return null;
  }

  return (
    <ModalButton
      as={Button}
      title={label}
      disabled={disabled || personalNotesPanel.isDisabled}
      modalSize="lg"
      render={() => {
        if (!personalNotesPanel.isLoaded) {
          return <div className="p-2 text-sm text-gray-700">Loading personal notes...</div>;
        }

        return personalNotesPanel.content || <div className="p-2 text-sm text-gray-700">No personal notes yet.</div>;
      }}
      renderFooter={({ close }) => (
        <div className="flex justify-end">
          <Button onClick={close}>Close</Button>
        </div>
      )}
    >
      {buttonLabel}
    </ModalButton>
  );
}

export function HooksTableGridRenderer({ table, mode, disabled }: HooksTableGridRendererProps) {
  const isReadOnly = mode === 'read';
  const isDisabled = !!disabled || isReadOnly;

  const rows = useMemo<HooksTableGridRow[]>(() => {
    return table.rows.map(row => {
      const values: Record<string, unknown> = {};

      for (const column of table.columns) {
        values[column.key] = row.getCell(column.key)?.value;
      }

      return {
        id: row.entityId,
        rowIndex: row.rowIndex,
        row,
        values,
      };
    });
  }, [table.columns, table.rows]);

  const columns = useMemo<readonly Column<HooksTableGridRow>[]>(() => {
    const baseColumns: Column<HooksTableGridRow>[] = table.columns.map(column => {
      const definition = hooksTableTestingRowFieldMap[column.key];

      return {
        key: column.key,
        name: column.label || column.key,
        width: definition?.type === 'checkbox-field' ? 120 : 220,
        resizable: true,
        renderCell: ({ row }) => {
          const value = row.values[column.key];

          if (isReadOnly) {
            return (
              <div className="flex h-full items-center px-2 py-1 text-sm">
                <span>{formatFieldValue(value, definition)}</span>
              </div>
            );
          }

          return (
            <div className="flex h-full items-center py-1">
              {renderEditableField({
                definition,
                value,
                inputId: `hooks-table-row-${row.rowIndex}-${column.key}`,
                disabled: isDisabled,
                onChange: nextValue => row.row.setCell(column.key, nextValue),
              })}
            </div>
          );
        },
      };
    });

    if (!isReadOnly) {
      baseColumns.push({
        key: '__actions__',
        name: 'Actions',
        width: 120,
        renderCell: ({ row }) => {
          return (
            <div className="flex h-full items-center justify-center">
              <Button onClick={() => table.removeRow(row.rowIndex)} disabled={isDisabled || table.rowCount < 2}>
                Remove
              </Button>
            </div>
          );
        },
      });
    }

    return baseColumns;
  }, [isDisabled, isReadOnly, table]);

  return (
    <>
      <style>
        {`
          .hooks-table-rdg .rdg-cell[aria-selected="true"] {
            outline: none !important;
          }
          .hooks-table-rdg .rdg-cell {
            border-inline-end: 1px solid #d4d8df !important;
            border-block-end: 1px solid #d4d8df !important;
          }
        `}
      </style>
      <DataGrid
        className="rdg-light hooks-table-rdg"
        columns={columns}
        rows={rows}
        rowKeyGetter={row => row.id}
        enableVirtualization={false}
        rowHeight={52}
        headerRowHeight={42}
        style={{
          minHeight: 300,
          border: '1px solid #d4d8df',
          ['--rdg-border-color' as string]: '#d4d8df',
          ['--rdg-selection-width' as string]: '0px',
        }}
      />
    </>
  );
}
