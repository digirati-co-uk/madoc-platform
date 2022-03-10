import { InternationalString } from '@hyperion-framework/types';
import produce from 'immer';
import { useMemo, useReducer } from 'react';
import { MetadataDefinition } from '../../../types/schemas/metadata-definition';
import { useClosestLanguage } from '../components/LocaleString';

export type MetadataEditorState = {
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

export type MetadataDiff = {
  added: Array<{ key: string; language: string; value: string }>;
  removed: number[];
  modified: Array<{ id?: number; key: string; language: string; value: string }>;
};

export type MetadataEditorActions =
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

export const metadataEditorReducer = produce((state: MetadataEditorState, action: MetadataEditorActions) => {
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

export const valuesToIntlString = (values: MetadataDefinition[]): InternationalString => {
  const languageMap: InternationalString = {};

  for (const { value, language } of values) {
    languageMap[language] = languageMap[language] ? languageMap[language] : [];
    (languageMap[language] as string[]).push(value);
  }

  return languageMap;
};

export const intlStringToValues = (intlStr: InternationalString, key: string): MetadataDefinition[] => {
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

export interface UseMetadataEditor {
  fields: InternationalString | MetadataDefinition[];
  availableLanguages?: string[];
  metadataKey?: string;
  defaultLocale?: string;
  allowCustomLanguage?: boolean;
  // Actions.
  onSave?: (data: {
    getDiff: () => MetadataDiff;
    key: string;
    items: MetadataDefinition[];
    toInternationalString: () => InternationalString;
  }) => void;
}

export function useMetadataEditor({
  fields,
  metadataKey = 'none',
  availableLanguages = ['en', 'none'],
  defaultLocale,
  onSave,
}: UseMetadataEditor) {
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

  const firstItem = defaultItem
    ? {
        id: defaultItem,
        field: state.fields[defaultItem],
      }
    : null;

  // Actions.
  const createNewItem = (select = true) =>
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

  const changeValue = (id: string, value: string) => {
    dispatch({
      type: 'CHANGE_VALUE',
      payload: { id, value },
    });
  };

  const changeLanguage = (id: string, language: string) => {
    dispatch({ type: 'CHANGE_LANGUAGE', payload: { id, language } });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };

  const getFieldByKey = (id: string) => {
    return state.fields[id];
  };

  return {
    // Data
    firstItem,
    fieldKeys,

    // Actions
    createNewItem,
    saveChanges,
    changeValue,
    changeLanguage,
    removeItem,
    getFieldByKey,
  } as const;
}
