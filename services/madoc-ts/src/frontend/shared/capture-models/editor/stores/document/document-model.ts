import { Action, Computed, Thunk } from 'easy-peasy';
import { CaptureModel } from '../../../types/capture-model';
import { BaseField } from '../../../types/field-types';
import { BaseSelector } from '../../../types/selector-types';

export type DocumentModel = {
  document: CaptureModel['document'];
  subtreePath: string[];
  selectedFieldKey: string | null;

  subtree: Computed<DocumentModel, CaptureModel['document']>;
  subtreeFieldKeys: Computed<DocumentModel, string[]>;
  subtreeFields: Computed<DocumentModel, Array<{ term: string; value: CaptureModel['document'] | BaseField }>>;
  setSubtree: Action<DocumentModel, string[]>;
  pushSubtree: Action<DocumentModel, string>;
  popSubtree: Action<DocumentModel, { count: number } | undefined>;

  selectField: Action<DocumentModel, string>;
  deselectField: Action<DocumentModel>;

  addField: Action<DocumentModel, { subtreePath?: string[]; term: string; field: BaseField; select?: boolean }>;
  removeField: Action<DocumentModel, string>;
  reorderField: Action<DocumentModel, { subtreePath?: string[]; term: string; startIndex: number; endIndex: number }>;

  // @todo re-implement when JSON-LD extension
  // setContext: Action<DocumentModel, CaptureModel['document']['@context']>;

  setLabel: Action<DocumentModel, string>;
  setDescription: Action<DocumentModel, string>;
  setSelector: Action<DocumentModel, { selector: BaseSelector | undefined }>;
  setSelectorState: Action<DocumentModel, { selectorType: string; selector: BaseSelector['state'] }>;
  setAllowMultiple: Action<DocumentModel, boolean>;
  setRequired: Action<DocumentModel, boolean>;
  setDependant: Action<DocumentModel, string>; // dependants ID
  setLabelledBy: Action<DocumentModel, string>;
  setPluralLabel: Action<DocumentModel, string>;

  setField: Thunk<DocumentModel, { term?: string; subtreePath?: string[]; field: BaseField }, any, DocumentModel>;
  setCustomProperty: Action<DocumentModel, { term?: string; subtreePath?: string[]; key: string; value: any }>;
  setCustomProperties: Action<
    DocumentModel,
    { term?: string; subtreePath?: string[]; values: Array<{ key: string; value: any }> }
  >;

  setFieldLabel: Action<DocumentModel, { term?: string; subtreePath?: string[]; label: string }>;
  setFieldDescription: Action<
    DocumentModel,
    { term?: string; subtreePath?: string[]; description: string | undefined }
  >;
  setFieldSelector: Action<
    DocumentModel,
    { term?: string; subtreePath?: string[]; selector: BaseSelector | undefined }
  >;
  setFieldSelectorState: Action<
    DocumentModel,
    { term?: string; selectorType: string; subtreePath?: string[]; selector: BaseSelector['state'] }
  >;
  setFieldValue: Action<DocumentModel, { term?: string; subtreePath?: string[]; value: BaseField['value'] }>;
  setFieldTerm: Action<DocumentModel, { subtreePath?: string[]; oldTerm: string; newTerm: string }>;
  setFieldType: Action<DocumentModel, { term?: string; subtreePath?: string[]; type: string; defaults?: any }>;
};
