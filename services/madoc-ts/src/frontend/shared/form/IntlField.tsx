import { SmallButton } from '../navigation/Button';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { InputContainer, InputLabel } from './Input';

const Textarea = React.lazy(() => /* webpackChunkName: "browser" */ import('react-textarea-autosize'));

export const IntlInputContainer = styled.div<{ focused?: boolean }>`
  background: #fff;
  border: 2px solid #999;
  margin-bottom: 0.8em;
  ${props =>
    props.focused
      ? css`
          border: 2px solid #5071f4;
        `
      : ''}
`;

export const IntlInputDefault = styled.div`
  display: flex;
  align-items: center;
  svg {
    margin: 0 0.2em;
  }
`;

const inputStyles = css`
  flex: 1 1 0px;
  background: #fff;
  border: none;
  padding-left: 0.4em;
  margin: 0.2em 0 0.2em 0.2em;
  border-radius: 0;
  font-size: 0.9em;
  border-right: 1px solid #ddd;
  font-family: inherit;
  resize: none;
  -webkit-appearance: none;
  tap-highlight-color: rgba(255, 255, 255, 0);
  line-height: 1.5em;

  &:focus {
    outline: none;
  }
`;

export const IntlInput = styled.input`
  ${inputStyles}
`;

const IntlMultilineInternal = styled(Textarea)`
  ${inputStyles}
`;

export const IntlMultiline: typeof IntlMultilineInternal = ((props: any) => {
  return (
    <React.Suspense fallback={<IntlInput {...props} />}>
      <IntlMultilineInternal {...props} />
    </React.Suspense>
  );
}) as any;

export const IntlInputButton = styled.button<{ active?: boolean }>`
  background: #fff;
  border: none;
  padding: 0.4em 0.8em;
  margin: 0.3em;
  font-size: 0.8em;
  text-align: center;
  color: #999;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    color: #333;
  }
  &:focus {
    outline: 2px solid #5071f4;
  }
  ${props =>
    props.active
      ? css`
          background: #6677f4;
          color: #fff;
          &:hover {
            color: #fff;
            background: #5071f4;
          }
        `
      : ''}
`;

export const IntlInputEditLanguage = styled.input`
  background: #fff;
  border: none;
  padding: 0.4em 0.8em;
  width: 4em;
  margin: 0.3em;
  font-size: 0.8em;
  text-align: center;
  color: #999;
`;

export const IntlInputExtraInput = styled.div`
  & ${IntlInputDefault} {
    border-top: 1px solid #ddd;
  }
`;

type MetadataItem = {
  id?: number;
  key: string;
  value: string;
  language: string;
  // source: string;
  // edited: boolean;
  // auto_update: boolean;
  // readonly: boolean;
  // data: any;
};

export const IntlField: React.FC<{
  values: MetadataItem[];
  primaryLang?: string;
  onUpdate?: (values: MetadataItem[]) => void;
  onAddValue?: () => void;
  fluid?: boolean;
}> = ({ values, fluid, primaryLang = 'en' }) => {
  // First primary language option – or first in list
  // Other items

  const primary: MetadataItem | undefined =
    values.find(val => {
      return val.language === primaryLang;
    }) || values[0];

  const others: MetadataItem[] = values.filter(val => val !== primary);

  // @todo non-edit mode as is
  // @todo edit mode with remove
  // @todo auto-update, readonly and edited status
  // @todo source display.
  // @todo version of this hooked up to API
  // @todo possible "revert to canonical" option or display of these labels.
  // @todo possible variation that works on international string directly, with less features.
  // @todo key-value pair variation.

  if (!primary) {
    // return a prompt to add a value.
    return <div>Click to add value.</div>;
  }

  return (
    <InputContainer fluid={fluid}>
      <InputLabel>Label</InputLabel>
      <IntlInputContainer>
        <IntlInputDefault>
          <IntlMultiline type="text" value={primary.value} />
          <IntlInputButton>{primary.language}</IntlInputButton>
        </IntlInputDefault>
        <IntlInputExtraInput style={{ display: 'none' }}>
          {others.map((other, key) => (
            <IntlInputDefault key={`${key}-${other.id}`}>
              <IntlInput type="text" value={other.value} />
              <IntlInputEditLanguage type="text" value={other.language} />
            </IntlInputDefault>
          ))}
          <IntlInputDefault style={{ padding: 10, justifyContent: 'center' }}>
            <SmallButton>Add new field</SmallButton>
          </IntlInputDefault>
        </IntlInputExtraInput>
      </IntlInputContainer>
    </InputContainer>
  );
};
