import React from 'react';
import { useTranslation } from 'react-i18next';
import { Heading1 } from '../../shared/atoms/Heading1';
import { ProjectStatus, ProjectContainer } from '../../shared/atoms/ProjectStatus';
import { LocaleString } from '../../shared/components/LocaleString';
import { Link } from 'react-router-dom';
import { Heading3, Subheading3 } from '../../shared/atoms/Heading3';
import { Pagination } from '../../shared/components/Pagination';
import { Button } from '../../shared/atoms/Button';
import { useProjectList } from '../hooks/use-project-list';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const AllProjects: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { resolvedData: data } = useProjectList();

  return (
    <>
      <Heading1>{t('All projects')}</Heading1>
      {data?.projects.map(project => (
        <ProjectContainer $status={project.status} key={project.id}>
          <LocaleString as={Heading3}>{project.label}</LocaleString>
          <LocaleString as={Subheading3}>{project.summary}</LocaleString>
          <Button $primary as={Link} to={createLink({ projectId: project.slug })}>
            {t('Go to project')}
          </Button>
          <ProjectStatus status={project.status} />
        </ProjectContainer>
      ))}
      <Pagination
        page={data ? data.pagination.page : undefined}
        totalPages={data ? data.pagination.totalPages : undefined}
        stale={!data}
      />
    </>
  );
};
