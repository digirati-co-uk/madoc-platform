import React from 'react';
import { CaptureModel } from './capture-model';
import { BaseField } from './field-types';
import { RevisionRequest } from './revision-request';
import { StructureType } from './utility';

export type RefinementSupportProps = {
  readOnly?: boolean;
};

export type RefinementComponentProps = RefinementSupportProps & {
  goBack?: (newPath?: Array<[string, string]>) => void;
  showNavigation?: boolean;
};

export type RefinementContext<Ref> = Ref extends Refinement<any, any, infer T, any> ? T : never;
export type RefinementType<Ref> = Ref extends Refinement<any, infer T, any, any> ? T : never;
export type RefinementActions<Ref> = Ref extends Refinement<any, any, any, infer T> ? T : never;

export type Refinement<Type, Subject, Context = {}, Actions = {}> = {
  name: string;
  type: Type;
  supports: (subject: { instance: Subject; property: string }, context: RefinementSupportProps & Context) => boolean;
  refine: (
    subject: { instance: Subject; property: string },
    context: RefinementComponentProps & Context & Actions,
    children?: any
  ) => React.ReactElement | null;
};

export type EntityRefinement = Refinement<
  'entity',
  CaptureModel['document'],
  { path: Array<[string, string]>; staticBreadcrumbs?: string[] },
  { hideSplash?: boolean; hideCard?: boolean }
>;

export type EntityListRefinement = Refinement<
  'entity-list',
  CaptureModel['document'][],
  { path: Array<[string, string]> }
>;

export type EntityInstanceListRefinement = Refinement<
  'entity-instance-list',
  CaptureModel['document'][],
  { path: Array<[string, string]> },
  {
    chooseEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  }
>;

export type FieldRefinement = Refinement<'field', BaseField, { path: Array<[string, string]> }>;

export type FieldListRefinement = Refinement<
  'field-list',
  CaptureModel['document'],
  { path: Array<[string, string]> },
  {
    chooseField: (field: { property: string; instance: BaseField }) => void;
    chooseEntity: (field: { property: string; instance: CaptureModel['document'] }) => void;
  }
>;

export type FieldInstanceListRefinement = Refinement<
  'field-instance-list',
  BaseField[],
  { path: Array<[string, string]> },
  {
    chooseField: (field: { property: string; instance: BaseField }) => void;
  }
>;

export type ChoiceRefinement = Refinement<
  'choice-navigation',
  CaptureModel['structure'],
  {
    currentRevisionId?: string | null;
    structure: CaptureModel['structure'];
  },
  {
    readMode?: boolean;
    pop: () => void;
    push: (id: string) => void;
    idStack: string[];
    goTo: (id: string) => void;
    onSaveRevision: (req: RevisionRequest) => Promise<void>;
  }
>;

export type RevisionListRefinement = Refinement<
  'revision-list',
  StructureType<'model'>,
  {
    revisions: RevisionRequest[];
  },
  {
    goBack?: () => void;
    unsavedIds?: string[];
    selectRevision: (options: { revisionId: string; readMode?: boolean }) => void;
    createRevision: (options: {
      revisionId: string;
      cloneMode: string;
      readMode?: boolean;
      modelMapping?: { [key: string]: string };
    }) => void;
  }
>;

export type UnknownRefinement =
  | EntityRefinement
  | EntityListRefinement
  | FieldRefinement
  | FieldListRefinement
  | EntityInstanceListRefinement
  | FieldInstanceListRefinement
  | ChoiceRefinement
  | RevisionListRefinement;
