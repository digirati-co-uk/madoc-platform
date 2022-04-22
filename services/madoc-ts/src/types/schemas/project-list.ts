import { Pagination } from './_pagination';
import { ProjectListItem } from './project-list-item';

export type ProjectList = {
  projects: Array<ProjectListItem>;
  pagination: Pagination;
};
