import { InternationalString } from '@hyperion-framework/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { ProjectFull } from '../../../types/project-full';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { ProjectContainer, ProjectStatus } from '../atoms/ProjectStatus';
import { Button } from '../navigation/Button';
import { Heading3, Subheading3 } from '../typography/Heading3';
import { LocaleString } from './LocaleString';

interface SingleProjectProps {
  customButtonLabel?: InternationalString;
  project?: { id: string };
  data?: ProjectFull;
}

export function SingleProject(props: SingleProjectProps) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { data, project, customButtonLabel } = props;

  if (!project || !data) {
    return null;
  }

  return (
    <ProjectContainer $status={data.status}>
      <LocaleString as={Heading3}>{data.label || { en: ['...'] }}</LocaleString>
      <LocaleString as={Subheading3}>{data.summary || { en: ['...'] }}</LocaleString>
      <Button $primary as={Link} to={createLink({ projectId: project.id })}>
        {customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('Go to project')}
      </Button>
      <ProjectStatus status={data.status} template={data.template} />
    </ProjectContainer>
  );
}

blockEditorFor(SingleProject, {
  label: 'Single project',
  type: 'SingleProject',
  defaultProps: {
    customButtonLabel: '',
    project: null,
  },
  hooks: [
    {
      name: 'getSiteProject',
      creator: props => (props.project ? [props.project.id] : undefined),
      mapToProps: (props, data) => {
        return { ...props, data };
      },
    },
  ],
  editor: {
    customButtonLabel: { type: 'text-field', label: 'Custom button label' },
    project: {
      label: 'Project',
      type: 'project-selector',
    },
  },
  requiredContext: [],
  anyContext: [],
});
