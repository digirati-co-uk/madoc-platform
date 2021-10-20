import React, { useMemo, useReducer, useState } from 'react';
import produce from 'immer';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { Button, ButtonRow, LinkButton } from '../../shared/navigation/Button';
import {
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../../shared/navigation/ContextualMenu';
import {
  IntlInput,
  IntlInputButton,
  IntlInputContainer,
  IntlInputDefault,
  IntlMultiline,
} from '../../shared/form/IntlField';
import { ModalButton } from '../../shared/components/Modal';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import styled, { css } from 'styled-components';
import { ExpandGrid, GridContainer } from '../../shared/layout/Grid';
import { useClosestLanguage } from '../../shared/components/LocaleString';
import { InternationalString } from '@hyperion-framework/types';
import { useTranslation } from 'react-i18next';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { EmptyInputValue } from '../../shared/form/Input';
import { useOptionalApi } from '../../shared/hooks/use-api';

export type MetadataDiff = {
  added: Array<{ key: string; language: string; value: string }>;
  removed: number[];
  modified: Array<{ id?: number; key: string; language: string; value: string }>;
};

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

type MetadataEditorState = {
  fieldIds: number[]; // for ordering.
  selected: string | undefined;
  fields: {
    [id: string]: MetadataDefinition;
  };
  modified: string[];
  removed: number[];
  added: string[];
  hasChanged: boolean;
};

type MetadataEditorActions =
  | {
      type: 'CHANGE_LANGUAGE';
      payload: {
        id: string;
        language: string;
      };
    }
  | {
      type: 'CHANGE_VALUE';
      payload: {
        id: string;
        value: string;
      };
    }
  | {
      type: 'REMOVE_ITEM';
      payload: { id: string };
    }
  | {
      type: 'CREATE_ITEM';
      payload: { id: string; key: string; language: string; value: string; select: boolean };
    }
  | {
      type: 'SELECT_ITEM';
      payload: { id: string };
    };

const metadataEditorReducer = produce((state: MetadataEditorState, action: MetadataEditorActions) => {
  switch (action.type) {
    case 'SELECT_ITEM': {
      // Toggle.
      state.selected = state.selected === action.payload.id ? undefined : action.payload.id;
      break;
    }

    case 'CHANGE_LANGUAGE': {
      state.hasChanged = true;
      state.fields[action.payload.id].language = action.payload.language;
      if (state.modified.indexOf(action.payload.id) === -1) {
        state.modified.push(action.payload.id);
      }
      state.selected = undefined;
      break;
    }

    case 'CHANGE_VALUE': {
      state.hasChanged = true;
      state.fields[action.payload.id].value = action.payload.value;
      if (state.modified.indexOf(action.payload.id) === -1) {
        state.modified.push(action.payload.id);
      }
      break;
    }

    case 'CREATE_ITEM': {
      state.hasChanged = true;
      state.fields[action.payload.id] = {
        language: action.payload.language,
        value: action.payload.value,
        key: action.payload.key,
      };
      if (action.payload.select) {
        state.selected = action.payload.id;
      }
      state.added.push(action.payload.id);
      break;
    }

    case 'REMOVE_ITEM': {
      state.hasChanged = true;
      const toRemove = state.fields[action.payload.id];
      delete state.fields[action.payload.id];
      if (typeof toRemove.id !== 'undefined') {
        state.removed.push(toRemove.id);
      }
      if (state.added.indexOf(action.payload.id) !== -1) {
        state.added = state.added.filter(id => id !== action.payload.id);
      }
      if (state.modified.indexOf(action.payload.id) !== -1) {
        state.modified = state.modified.filter(id => id !== action.payload.id);
      }
      if (state.selected === action.payload.id) {
        state.selected = undefined;
      }
      break;
    }

    default:
      return state;
  }
});

const valuesToIntlString = (values: MetadataDefinition[]): InternationalString => {
  const languageMap: InternationalString = {};

  for (const { value, language } of values) {
    languageMap[language] = languageMap[language] ? languageMap[language] : [];
    (languageMap[language] as string[]).push(value);
  }

  return languageMap;
};

const intlStringToValues = (intlStr: InternationalString, key: string): MetadataDefinition[] => {
  if (!intlStr) {
    return [];
  }

  const languages = Object.keys(intlStr);
  const items: MetadataDefinition[] = [];
  let count = 0;
  for (const lang of languages) {
    for (const value of intlStr[lang] || []) {
      items.push({
        language: lang,
        id: count,
        key,
        value,
      });
      count++;
    }
  }
  return items;
};

export const createInitialValues = ({
  key,
  fields: input,
}: {
  key: string;
  fields: InternationalString | Array<MetadataDefinition>;
}) => {
  const fields = Array.isArray(input) ? input : intlStringToValues(input, key);

  const fieldIds = fields.map(field => {
    return field.id;
  });

  const fieldMap: any = {};
  for (const f of fields) {
    fieldMap[`original-${f.id}`] = f;
  }

  return {
    selected: undefined,
    fieldIds,
    fields: fieldMap,
    modified: [],
    removed: [],
    added: [],
    hasChanged: false,
  } as MetadataEditorState;
};

const LanguageCol = styled.div`
  min-width: 100px;
`;

const LanguageList = styled.ul`
  padding: 10px;
  text-align: center;
  position: sticky;
  top: 0;
`;

const LanguageItem = styled.li`
  list-style: none;
  font-weight: bold;
  margin: 0.4em;
  ${LinkButton} {
    font-weight: normal;
  }
`;

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
    <IntlInputContainer focused={isFocused}>
      <IntlInputDefault>
        <CloseIcon disabled={!removable} title={t('remove')} onClick={onRemove} />
        <IntlMultiline
          autoComplete="off"
          type="text"
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

export const MetadataEditor: React.FC<MetadataEditorProps> = ({
  id,
  label,
  fields,
  metadataKey,
  availableLanguages,
  defaultLocale,
  onSave,
  disabled,
  fluid,
}) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);
  const api = useOptionalApi();
  const [state, dispatch] = useReducer(metadataEditorReducer, { fields, key: metadataKey }, createInitialValues);

  // Computed values.
  const fieldKeys = Object.keys(state.fields);
  // Returns a language code to display as the default to the user, based on their language.
  const closestLang = useClosestLanguage(() => fieldKeys.map(key => state.fields[key].language), [state.fields]);
  const defaultItem = useMemo(() => {
    if (state.fields) {
      const keys = Object.keys(state.fields);
      for (const key of keys) {
        if (state.fields[key].language === closestLang) {
          return key;
        }
      }
    }
  }, [state.fields, closestLang]);
  const firstItem = defaultItem ? state.fields[defaultItem] : undefined;

  // Actions.
  const createNewItem = (select = true) => () =>
    dispatch({
      type: 'CREATE_ITEM',
      payload: {
        id: `new-${new Date().getTime()}-${fieldKeys.length}`,
        key: metadataKey,
        language: defaultLocale || availableLanguages[0],
        value: '',
        select,
      },
    });

  const saveChanges = () => {
    if (onSave && state && state.hasChanged) {
      onSave({
        items: Object.values(state.fields),
        key: metadataKey,
        getDiff: () => ({
          added: (state.added as string[]).map(fid => state.fields[fid]),
          removed: state.removed as number[],
          modified: (state.modified as string[])
            .filter(fid => state.added.indexOf(fid) === -1)
            .map(fid => state.fields[fid]),
        }),
        toInternationalString: () => valuesToIntlString(Object.values(state.fields)),
      });
    }
  };

  const fieldList = () => (
    <div>
      <GridContainer>
        <ExpandGrid>
          {fieldKeys.map(key => {
            const field = state.fields[key];

            return (
              <MetadataField
                key={key}
                language={field.language}
                value={field.value}
                removable={fieldKeys.length > 1}
                onSelectLanguage={(lang: string) =>
                  dispatch({ type: 'CHANGE_LANGUAGE', payload: { id: key, language: lang } })
                }
                onChange={value =>
                  dispatch({
                    type: 'CHANGE_VALUE',
                    payload: {
                      id: key,
                      value,
                    },
                  })
                }
                availableLanguages={availableLanguages}
                onRemove={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: key } })}
              />
            );
          })}
        </ExpandGrid>
      </GridContainer>
    </div>
  );

  const fieldListFooter = ({ close }: { close: () => void }) => (
    <ButtonRow $noMargin>
      <Button onClick={createNewItem(true)}>{t('Add new field')}</Button>
      <Button $primary onClick={close}>
        {t('Finish editing')}
      </Button>
    </ButtonRow>
  );

  if (!firstItem || !defaultItem) {
    return (
      <EmptyInputValue>
        {t('No values exist for this')} <LinkButton onClick={createNewItem(false)}>{t('Add new')}</LinkButton>
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
            type="text"
            onBlur={() => {
              setIsFocused(false);
              saveChanges();
            }}
            id={id}
            onFocus={() => setIsFocused(true)}
            value={firstItem.value}
            onChange={e =>
              dispatch({
                type: 'CHANGE_VALUE',
                payload: {
                  id: defaultItem,
                  value: e.currentTarget.value,
                },
              })
            }
          />
          <ModalButton
            render={fieldList}
            renderFooter={fieldListFooter}
            title={label || metadataKey || t('Editing field')}
            onClose={saveChanges}
          >
            <IntlInputButton>
              {firstItem.language} {fieldKeys.length > 1 ? `+ ${fieldKeys.length - 1}` : ''}
            </IntlInputButton>
          </ModalButton>
        </IntlInputDefault>
      </IntlInputContainer>
    </MetadataEditorContainer>
  );
};
