import React, { useContext, useMemo } from 'react';
import {
  type TabularColumnEditorValue,
  type TabularFieldPlugin,
} from './types';
import { PluginContext } from '../../../../shared/capture-models/plugin-api/context';
import { Segment } from '../../../../shared/capture-models/editor/atoms/Segment';
import { ChooseFieldButton } from '../../../../shared/capture-models/editor/components/ChooseFieldButton/ChooseFieldButton';
import {
  StyledForm,
  StyledFormLabel,
  StyledFormInputElement,
  StyledFormTextarea,
} from '@/frontend/shared/capture-models/editor/atoms/StyledForm';
import { TinyButton } from '@/frontend/shared/navigation/Button';
import { DeleteForeverIcon } from '@/frontend/shared/icons/DeleteForeverIcon';

const supportedFieldTypes = ['text-field', 'dropdown-field', 'date-field', 'read-only-field'];

export function TabularColumnEditor(props: {
  index: number;
  value: TabularColumnEditorValue;
  maxHeadingLength?: number;
  disabled?: boolean;
  error?: string;
  onChange: (next: TabularColumnEditorValue) => void;
  onRemove?: () => void;
  removeDisabled?: boolean;
}) {
  const { value, maxHeadingLength = 80, disabled, error, onChange, onRemove, removeDisabled } = props;
  const { fields } = useContext(PluginContext);

  const availableFieldTypes = useMemo(
    () =>
      Object.values(fields).filter(
        (field): field is TabularFieldPlugin => !!field && supportedFieldTypes.includes(field.type)
      ),
    [fields]
  );
  const fieldTypeOptions = useMemo(
    () =>
      availableFieldTypes.length
        ? availableFieldTypes
        : ([
            { type: 'text-field', label: 'Text field', description: 'Simple text field' },
            {
              type: 'dropdown-field',
              label: 'Dropdown field',
              description: 'Simple list of static values',
            },
            { type: 'date-field', label: 'Date field', description: 'Typed date (DD-MM-YYYY)' },
            {
              type: 'read-only-field',
              label: 'Read-only field',
              description: 'Displays text but cannot be edited by contributors',
            },
          ] as TabularFieldPlugin[]),
    [availableFieldTypes]
  );

  const selectedFieldType = useMemo(
    () =>
      fieldTypeOptions.find(field => field.type === value.fieldType) ||
      fieldTypeOptions.find(field => field.type === 'text-field'),
    [fieldTypeOptions, value.fieldType]
  );
  const selectedType = selectedFieldType?.type || 'text-field';
  const isDropdownSelected = selectedType === 'dropdown-field';
  const updateColumn = (nextValue: Partial<TabularColumnEditorValue>) => {
    onChange({
      ...value,
      ...nextValue,
    });
  };

  return (
    <Segment style={{ borderTopColor: 'lightcoral' }}>
      <StyledForm
        onSubmit={e => {
          e.preventDefault();
        }}
      >
        <div style={{ display: 'grid', gap: 6 }}>
          <StyledFormLabel>Heading *</StyledFormLabel>
          <StyledFormInputElement
            as="input"
            value={value.heading}
            placeholder="Enter column heading"
            disabled={disabled}
            maxLength={maxHeadingLength}
            aria-invalid={error ? 'true' : 'false'}
            onChange={(event: any) => updateColumn({ heading: event.target.value })}
            style={{
              boxShadow: error ? '0 0 0 2px rgba(220, 38, 38, 0.25)' : undefined,
            }}
          />
          <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>Required. Max {maxHeadingLength} characters.</div>
          {error ? <div style={{ marginTop: 6, fontSize: 12, color: '#b91c1c' }}>{error}</div> : null}
        </div>

        <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
          <StyledFormLabel>Field type *</StyledFormLabel>
          <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, overflow: 'hidden' }}>
            <ChooseFieldButton
              key={`tabular-column-field-type-${props.index}`}
              fieldType={selectedType}
              allowedFieldTypes={supportedFieldTypes}
              onChange={next => updateColumn({ fieldType: next || 'text-field' })}
            />
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              {selectedFieldType?.description ?? 'Select the field type for this column.'}
            </div>
          </div>
        </div>

        {isDropdownSelected ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <StyledFormLabel>Dropdown options (value,label one per line)</StyledFormLabel>
            <StyledFormTextarea
              rows={4}
              value={value.dropdownOptionsText ?? ''}
              placeholder=""
              disabled={disabled}
              onChange={(event: any) => updateColumn({ dropdownOptionsText: event.target.value })}
            />
          </div>
        ) : null}

        <div style={{ display: 'grid', gap: 6 }}>
          <StyledFormLabel>Tooltip (optional)</StyledFormLabel>
          <StyledFormInputElement
            as="input"
            value={value.helpText ?? ''}
            placeholder="Optional help text shown to users for this column"
            disabled={disabled}
            onChange={(event: any) => updateColumn({ helpText: event.target.value })}
          />
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <StyledFormLabel />
          <div style={{ display: 'flex', marginTop: 6 }}>
            {onRemove ? (
              <TinyButton type="button" onClick={onRemove} disabled={disabled || removeDisabled}>
                <DeleteForeverIcon />
                Remove column
              </TinyButton>
            ) : null}
          </div>
        </div>
      </StyledForm>
    </Segment>
  );
}
