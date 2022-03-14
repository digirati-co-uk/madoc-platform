import { BaseProperty } from './base-property';
import { BaseField } from './field-types';

export type NestedModelFields = [string, ModelFields];

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ModelFields extends Array<string | NestedModelFields> {}

export interface Document extends BaseProperty {
  id: string;
  // @todo future implementation of JSON-LD Extension. Added as optional for now.
  '@context'?: string | ({ [key: string]: string } & { '@vocab'?: string });
  type: 'entity';
  properties: {
    [term: string]: Array<BaseField> | Array<Document>;
  };
}

export type Revision = {
  id: string;
  label?: string;
  status?: StatusTypes;
  structureId?: string;
  workflowId?: string;
  source?: 'structure' | 'canonical' | 'unknown';
  authors?: string[];
  fields: ModelFields;
  approved?: boolean;
  revises?: string;
  deletedFields?: string[];
};

export type StatusTypes = 'draft' | 'submitted' | 'accepted';

export type Target = {
  id: string;
  type: string;
};

export type Contributor = {
  id: string;
  type: 'Person' | 'Organization' | 'Software';
  email?: string;
  homepage?: string;
  email_sha1?: string;
  name?: string;
  nickname?: string;
};

export type CaptureModel = {
  id?: string;
  derivedFrom?: string;
  profile?: string;
  structure: {
    id: string;
    label: string;
    profile?: string[];
    description?: string;
  } & (
    | {
        type: 'choice';
        items: Array<CaptureModel['structure']>;
      }
    | {
        type: 'model';
        fields: ModelFields;
        instructions?: string;
        modelRoot?: string[];
        pluralLabel?: string;
        forkValues?: boolean;
        editableAboveRoot?: boolean;
        preventAdditionsAdjacentToRoot?: boolean;
      }
  );
  document: Document;
  revisions?: Array<Revision>;
  target?: Array<Target>;
  contributors?: {
    [id: string]: Contributor;
  };
  integrity?: {
    _hash?: string;
  } & {
    [key: string]:
      | {
          _hash?: string;
        }
      | {
          [key: string]: CaptureModel['integrity'];
        };
  };
};
