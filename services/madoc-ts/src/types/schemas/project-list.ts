import { Pagination } from './_pagination';
import { InternationalString } from '@hyperion-framework/types';
import { ProjectListItem } from './project-list-item';

export type ProjectList = {
  projects: Array<ProjectListItem>;
  pagination: Pagination;
};
