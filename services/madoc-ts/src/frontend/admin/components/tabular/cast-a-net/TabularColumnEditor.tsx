import React, { useContext, useMemo } from 'react';
import type { TabularColumnEditorValue, TabularFieldPlugin, TabularFieldType } from './types';
import { PluginContext } from '../../../../shared/capture-models/plugin-api/context';
import { Segment } from '../../../../shared/capture-models/editor/atoms/Segment';
import { Dropdown } from '../../../../shared/capture-models/editor/atoms/Dropdown';
import {
  StyledForm,
  StyledFormLabel,
  StyledFormInputElement,
} from '../../../../shared/capture-models/editor/atoms/StyledForm';
import { TinyButton } from '@/frontend/shared/navigation/Button';
import { DeleteForeverIcon } from '@/frontend/shared/icons/DeleteForeverIcon';

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
    () => Object.values(fields).filter(Boolean) as Array<TabularFieldPlugin>,
    [fields]
  );

  const selectedType = useMemo(() => {
    if (!value.fieldType) return undefined;
    return availableFieldTypes.find(field => field.type === value.fieldType);
  }, [availableFieldTypes, value.fieldType]);

  const typeOptions = useMemo(
    () =>
      availableFieldTypes.map(field => ({
        text: field.label,
        value: field.type,
        label: field.type,
      })),
    [availableFieldTypes]
  );
  const hasSelectedType = Boolean(value.fieldType && typeOptions.find(option => option.value === value.fieldType));
  const typeLabel = selectedType?.label ?? value.fieldType ?? 'Select field type';
  const dropdownOptions = hasSelectedType
    ? [{ text: 'Select field type', value: '' }, ...typeOptions]
    : value.fieldType
      ? [
          { text: 'Select field type', value: '' },
          { text: value.fieldType, value: value.fieldType, label: value.fieldType },
          ...typeOptions,
        ]
      : [{ text: 'Select field type', value: '' }, ...typeOptions];

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
            onChange={(e: any) => onChange({ ...value, heading: e.target.value })}
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
            <Dropdown
              value={value.fieldType ?? ''}
              placeholder={typeLabel}
              options={dropdownOptions}
              onChange={(next: any) =>
                onChange({ ...value, fieldType: (next || undefined) as TabularFieldType | undefined })
              }
              disabled={disabled || typeOptions.length === 0}
            />
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              {selectedType?.description ??
                (value.fieldType
                  ? `Selected type: ${value.fieldType}`
                  : 'Pick a type to control how data entry will work. Required before saving model.')}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gap: 6 }}>
          <StyledFormLabel>Tooltip (optional)</StyledFormLabel>
          <StyledFormInputElement
            as="input"
            value={value.helpText ?? ''}
            placeholder="Optional help text shown to users"
            disabled={disabled}
            onChange={(e: any) => onChange({ ...value, helpText: e.target.value })}
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
