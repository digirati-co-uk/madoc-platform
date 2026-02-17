import { useFormikContext } from 'formik';
import React from 'react';
import {
  StyledCheckbox,
  StyledCheckboxContainer,
  StyledCheckboxDescription,
  StyledCheckboxLabel,
  StyledFormField,
  StyledFormLabel,
} from '../../atoms/StyledForm';
import { HTML_FIELD_DEFAULT_ALLOWED_TAGS, HTML_FIELD_SUPPORTED_TAGS } from './html-field-tags';

type Props = {
  allowedTags?: string[];
  enableHistory?: boolean;
  enableExternalImages?: boolean;
  enableLinks?: boolean;
  enableStylesDropdown?: boolean;
};

type FormValues = Props & {
  [key: string]: unknown;
};

const BooleanSetting: React.FC<{
  name: keyof Props;
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}> = ({ name, label, description, checked, onChange }) => {
  return (
    <StyledCheckboxContainer data-no-description="false">
      <StyledCheckbox
        id={`html-field-editor-${name}`}
        type="checkbox"
        checked={checked}
        onChange={event => onChange(event.currentTarget.checked)}
      />
      <StyledCheckboxLabel>{label}</StyledCheckboxLabel>
      <StyledCheckboxDescription>{description}</StyledCheckboxDescription>
    </StyledCheckboxContainer>
  );
};

const HTMLFieldEditor: React.FC<Props> = () => {
  const { values, setFieldValue } = useFormikContext<FormValues>();
  const configuredAllowedTags = Array.isArray(values.allowedTags)
    ? values.allowedTags.map(tag => String(tag).toLowerCase())
    : HTML_FIELD_DEFAULT_ALLOWED_TAGS;
  const allowedTagSet = new Set(configuredAllowedTags);

  const setBooleanValue = (name: keyof Props, checked: boolean) => {
    setFieldValue(name, checked);
  };

  const toggleTag = (tag: string) => {
    const next = new Set(configuredAllowedTags);
    if (next.has(tag)) {
      next.delete(tag);
    } else {
      next.add(tag);
    }
    setFieldValue('allowedTags', Array.from(next));
  };

  return (
    <>
      <StyledFormField>
        <StyledFormLabel>Editor controls</StyledFormLabel>
        <div style={{ border: '1px solid rgba(5, 42, 68, 0.15)', borderRadius: 3 }}>
          <BooleanSetting
            name="enableHistory"
            checked={!!values.enableHistory}
            label="Enable history (undo/redo)"
            description="Show undo and redo controls in the toolbar."
            onChange={checked => setBooleanValue('enableHistory', checked)}
          />
          <BooleanSetting
            name="enableExternalImages"
            checked={!!values.enableExternalImages}
            label="Allow external images"
            description="Enable inserting <img> elements from external URLs."
            onChange={checked => setBooleanValue('enableExternalImages', checked)}
          />
          <BooleanSetting
            name="enableLinks"
            checked={!!values.enableLinks}
            label="Enable links"
            description="Enable link editing controls for <a> tags."
            onChange={checked => setBooleanValue('enableLinks', checked)}
          />
          <BooleanSetting
            name="enableStylesDropdown"
            checked={!!values.enableStylesDropdown}
            label="Enable style dropdown"
            description="Show style controls for headings and code blocks."
            onChange={checked => setBooleanValue('enableStylesDropdown', checked)}
          />
        </div>
      </StyledFormField>

      <StyledFormField>
        <StyledFormLabel>Supported HTML tags</StyledFormLabel>
        <div style={{ border: '1px solid rgba(5, 42, 68, 0.15)', borderRadius: 3 }}>
          {HTML_FIELD_SUPPORTED_TAGS.map(option => (
            <StyledCheckboxContainer key={option.tag} data-no-description="false">
              <StyledCheckbox
                id={`html-field-tag-${option.tag}`}
                type="checkbox"
                checked={allowedTagSet.has(option.tag)}
                onChange={() => toggleTag(option.tag)}
              />
              <StyledCheckboxLabel>
                <code>{`<${option.tag}>`}</code> {option.label}
              </StyledCheckboxLabel>
              <StyledCheckboxDescription>{option.description}</StyledCheckboxDescription>
            </StyledCheckboxContainer>
          ))}
        </div>
      </StyledFormField>
    </>
  );
};

export default HTMLFieldEditor;
