import React, { useContext, useMemo } from 'react';
import type { TabularColumnEditorValue, TabularFieldPlugin } from './types';
import { PluginContext } from '../../../../shared/capture-models/plugin-api/context';
import { Segment } from '../../../../shared/capture-models/editor/atoms/Segment';
import {
  StyledForm,
  StyledFormLabel,
  StyledFormInputElement,
} from '../../../../shared/capture-models/editor/atoms/StyledForm';
import { TinyButton } from '@/frontend/shared/navigation/Button';
import { DeleteForeverIcon } from '@/frontend/shared/icons/DeleteForeverIcon';

const TEXT_FIELD_TYPE = 'text-field';

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

  const textFieldType = useMemo(
    () => availableFieldTypes.find(field => field.type === TEXT_FIELD_TYPE),
    [availableFieldTypes]
  );
  const typeLabel = textFieldType?.label ?? 'Text';

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
            <StyledFormInputElement as="input" value={typeLabel} readOnly disabled />
            <div style={{ marginTop: 6, fontSize: 12, opacity: 0.75 }}>
              {textFieldType?.description ?? 'Field type is fixed to Text for tabular projects.'}
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
