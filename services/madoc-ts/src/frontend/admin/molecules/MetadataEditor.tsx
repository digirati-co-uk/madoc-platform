import { InternationalString } from '@hyperion-framework/types';
import React, { useState } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { ModalButton } from '../../shared/components/Modal';
import { EmptyInputValue } from '../../shared/form/Input';
import {
  IntlInput,
  IntlInputButton,
  IntlInputContainer,
  IntlInputDefault,
  IntlMultiline,
} from '../../shared/form/IntlField';
import { useOptionalApi } from '../../shared/hooks/use-api';
import { MetadataDiff, useMetadataEditor } from '../../shared/hooks/use-metadata-editor';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { ExpandGrid, GridContainer } from '../../shared/layout/Grid';
import { Button, ButtonRow, LinkButton } from '../../shared/navigation/Button';
import {
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../../shared/navigation/ContextualMenu';

export type MetadataEditorProps = {
  id?: string;
  fields: InternationalString | MetadataDefinition[];
  metadataKey: string;
  availableLanguages: string[];
  defaultLocale?: string;
  allowCustomLanguage?: boolean;
  label?: string;
  disabled?: boolean;
  // Actions.
  onSave?: (data: {
    getDiff: () => MetadataDiff;
    key: string;
    items: MetadataDefinition[];
    toInternationalString: () => InternationalString;
  }) => void;
  fluid?: boolean;
};

const MetadataEditorContainer = styled.div<{ enabled?: boolean; fluid?: boolean }>`
  width: 100%;
  max-width: ${props => (props.fluid ? '100%' : '450px')};
  ${props =>
    typeof props.enabled !== 'undefined' && !props.enabled
      ? css`
          pointer-events: none;
          opacity: 0.7;
        `
      : ''}
`;

const LanguageMenu: React.FC<{ language: string; languages: string[]; onSelectLanguage: (code: string) => void }> = ({
  language,
  languages,
  onSelectLanguage,
}) => {
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(languages.length + 1);

  return (
    <ContextualPositionWrapper>
      <IntlInputButton {...buttonProps}>{language}</IntlInputButton>
      <ContextualMenuWrapper $padding $isOpen={isOpen} $right>
        <ContextualMenuList>
          <ContextualMenuListItem
            $disabled={language === 'none'}
            onClick={() => onSelectLanguage('none')}
            {...itemProps[0]}
          >
            none
          </ContextualMenuListItem>
          {languages.map((lng, k) => {
            return (
              <ContextualMenuListItem
                key={lng}
                $disabled={language === lng}
                onClick={() => onSelectLanguage(lng)}
                {...itemProps[k + 1]}
              >
                {lng}
              </ContextualMenuListItem>
            );
          })}
        </ContextualMenuList>
      </ContextualMenuWrapper>
    </ContextualPositionWrapper>
  );
};

const MetadataField: React.FC<{
  language: string;
  value: string;
  removable?: boolean;
  onRemove: () => void;
  onChange: (value: string) => void;
  onSelectLanguage: (code: string) => void;
  availableLanguages: string[];
}> = ({ language, removable, value, availableLanguages, onChange, onSelectLanguage, onRemove }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <IntlInputContainer focused={isFocused} $margin>
      <IntlInputDefault>
        <CloseIcon disabled={!removable} title={t('remove')} onClick={onRemove} />
        <IntlMultiline
          autoComplete="off"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={e => onChange(e.currentTarget.value)}
        />
        <LanguageMenu language={language} languages={availableLanguages} onSelectLanguage={onSelectLanguage} />
      </IntlInputDefault>
    </IntlInputContainer>
  );
};

export const MetadataEditor: React.FC<MetadataEditorProps> = props => {
  const { id, label, metadataKey, availableLanguages, disabled, fluid } = props;
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const api = useOptionalApi();
  const {
    firstItem,
    fieldKeys,
    getFieldByKey,
    changeValue,
    changeLanguage,
    saveChanges,
    removeItem,
    createNewItem,
  } = useMetadataEditor(props);

  const fieldList = () => (
    <div>
      <GridContainer>
        <ExpandGrid>
          {fieldKeys.map(key => {
            const field = getFieldByKey(key);

            return (
              <MetadataField
                key={key}
                language={field.language}
                value={field.value}
                removable={fieldKeys.length > 1}
                onSelectLanguage={(lang: string) => changeLanguage(key, lang)}
                onChange={value => changeValue(key, value)}
                availableLanguages={availableLanguages}
                onRemove={() => removeItem(key)}
              />
            );
          })}
        </ExpandGrid>
      </GridContainer>
    </div>
  );

  const fieldListFooter = ({ close }: { close: () => void }) => (
    <ButtonRow $noMargin>
      <Button onClick={() => createNewItem(true)}>{t('Add new field')}</Button>
      <Button $primary onClick={close}>
        {t('Finish editing')}
      </Button>
    </ButtonRow>
  );

  if (!firstItem) {
    return (
      <EmptyInputValue>
        {t('No values exist for this')} <LinkButton onClick={() => createNewItem(false)}>{t('Add new')}</LinkButton>
      </EmptyInputValue>
    );
  }

  const Component: typeof IntlMultiline = api && api.getIsServer() ? (IntlInput as any) : IntlMultiline;

  return (
    <MetadataEditorContainer enabled={!disabled} fluid={fluid}>
      <IntlInputContainer focused={isFocused}>
        <IntlInputDefault>
          <Component
            autoComplete="off"
            onBlur={() => {
              setIsFocused(false);
              saveChanges();
            }}
            id={id}
            onFocus={() => setIsFocused(true)}
            value={firstItem.field.value}
            onChange={e => changeValue(firstItem.id, e.currentTarget.value)}
          />
          <ModalButton
            render={fieldList}
            renderFooter={fieldListFooter}
            title={label || metadataKey || t('Editing field')}
            onClose={saveChanges}
          >
            <IntlInputButton>
              {firstItem.field.language} {fieldKeys.length > 1 ? `+ ${fieldKeys.length - 1}` : ''}
            </IntlInputButton>
          </ModalButton>
        </IntlInputDefault>
      </IntlInputContainer>
    </MetadataEditorContainer>
  );
};
