import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Button } from '../../shared/navigation/Button';
import { Heading3, Subheading3 } from '../../shared/typography/Heading3';
import { ProjectContainer, ProjectStatus } from '../../shared/atoms/ProjectStatus';
import { LocaleString } from '../../shared/components/LocaleString';
import { useProjectList } from '../hooks/use-project-list';
import { useRelativeLinks } from '../hooks/use-relative-links';

export const AllProjectsPaginatedItems: React.FC = () => {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { resolvedData: data } = useProjectList();

  return (
    <>
      {data?.projects.map(project => (
        <ProjectContainer $status={project.status} key={project.id}>
          <LocaleString as={Heading3}>{project.label}</LocaleString>
          <LocaleString as={Subheading3}>{project.summary}</LocaleString>
          <Button $primary as={Link} to={createLink({ projectId: project.slug })}>
            {t('Go to project')}
          </Button>
          <ProjectStatus status={project.status} template={project.template} />
        </ProjectContainer>
      ))}
    </>
  );
};

blockEditorFor(AllProjectsPaginatedItems, {
  type: 'default.AllProjectsPaginatedItems',
  label: 'All projects listing',
  internal: true,
  source: {
    name: 'All projects page',
    type: 'custom-page',
    id: '/projects',
  },
  anyContext: [],
  requiredContext: [],
  editor: {},
});
