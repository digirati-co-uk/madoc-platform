import { BaseSelector } from './selector-types';

export interface BaseProperty {
  label: string;
  description?: string;
  authors?: string[];
  term?: string;
  revision?: string;
  labelledBy?: string;
  pluralLabel?: string;
  revises?: string;
  selector?: BaseSelector;
  allowMultiple?: boolean;
  immutable?: boolean;
  profile?: string;
  dataSources?: string[];
  sortOrder?: number;
}
