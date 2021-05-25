import React, { useMemo, useReducer, useState } from 'react';
import produce from 'immer';
import { Button, LinkButton } from '../../shared/atoms/Button';
import { IntlInput, IntlInputButton, IntlInputContainer, IntlInputDefault } from '../../shared/atoms/IntlField';
import { ModalButton } from '../../shared/components/Modal';
import { CloseIcon } from '../../shared/atoms/CloseIcon';
import styled, { css } from 'styled-components';
import { ExpandGrid, GridContainer } from '../../shared/atoms/Grid';
import { useClosestLanguage } from '../../shared/components/LocaleString';
import { InternationalString } from '@hyperion-framework/types';
import { useTranslation } from 'react-i18next';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { EmptyInputValue } from '../../shared/atoms/Input';

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

const MetadataField: React.FC<{
  language: string;
  value: string;
  removable?: boolean;
  onRemove: () => void;
  onChange: (value: string) => void;
  selected?: boolean;
  onLanguageSelect: () => void;
}> = ({ language, removable, value, selected, onChange, onLanguageSelect, onRemove }) => {
  const { t } = useTranslation();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <IntlInputContainer focused={isFocused}>
      <IntlInputDefault>
        <CloseIcon disabled={!removable} title={t('remove')} onClick={onRemove} />
        <IntlInput
          autoComplete="off"
          type="text"
          value={value}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={e => onChange(e.currentTarget.value)}
        />
        <IntlInputButton active={selected} onClick={onLanguageSelect}>
          {language}
        </IntlInputButton>
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
  const [state, dispatch] = useReducer(metadataEditorReducer, { fields, key: metadataKey }, createInitialValues);

  // Computed values.
  const fieldKeys = Object.keys(state.fields);
  // Returns a language code to display as the default to the user, based on their language.
  const closestLang = useClosestLanguage(() => fieldKeys.map(key => state.fields[key].language), [state.fields]);
  const selected = state.selected;
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

  // Components
  const languageSwitch = selected ? (
    <LanguageCol>
      <LanguageList>
        {availableLanguages.map(lang =>
          state.fields[selected].language === lang ? (
            <LanguageItem key={lang}>{lang}</LanguageItem>
          ) : (
            <LanguageItem key={lang}>
              <LinkButton
                key={lang}
                onClick={() => dispatch({ type: 'CHANGE_LANGUAGE', payload: { id: selected, language: lang } })}
              >
                {lang}
              </LinkButton>
            </LanguageItem>
          )
        )}
      </LanguageList>
    </LanguageCol>
  ) : null;

  const fieldList = ({ close }: { close: () => void }) => (
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
                selected={key === state.selected}
                onChange={value =>
                  dispatch({
                    type: 'CHANGE_VALUE',
                    payload: {
                      id: key,
                      value,
                    },
                  })
                }
                onRemove={() => dispatch({ type: 'REMOVE_ITEM', payload: { id: key } })}
                onLanguageSelect={() => dispatch({ type: 'SELECT_ITEM', payload: { id: key } })}
              />
            );
          })}
        </ExpandGrid>
        {languageSwitch}
      </GridContainer>
      <LinkButton onClick={createNewItem(true)}>{t('Add new')}</LinkButton>
      <div style={{ marginTop: '2em' }}>
        <Button onClick={close}>{t('Finish editing')}</Button>
      </div>
    </div>
  );

  if (!firstItem || !defaultItem) {
    return (
      <EmptyInputValue>
        {t('No values exist for this')} <LinkButton onClick={createNewItem(false)}>{t('Add new')}</LinkButton>
      </EmptyInputValue>
    );
  }

  return (
    <MetadataEditorContainer enabled={!disabled} fluid={fluid}>
      <IntlInputContainer focused={isFocused}>
        <IntlInputDefault>
          <IntlInput
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
          <ModalButton render={fieldList} title={label || metadataKey || t('Editing field')} onClose={saveChanges}>
            <IntlInputButton>
              {firstItem.language} {fieldKeys.length > 1 ? `+ ${fieldKeys.length - 1}` : ''}
            </IntlInputButton>
          </ModalButton>
        </IntlInputDefault>
      </IntlInputContainer>
    </MetadataEditorContainer>
  );
};
