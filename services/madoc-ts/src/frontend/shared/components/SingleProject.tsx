import { InternationalString } from '@hyperion-framework/types';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Project } from '../../../types/project-full';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { ObjectContainer } from '../atoms/ObjectContainer';
import { ProjectStatus } from '../atoms/ProjectStatus';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { Button } from '../navigation/Button';
import { Heading3, Subheading3 } from '../typography/Heading3';
import { LocaleString } from './LocaleString';

interface SingleProjectProps {
  customButtonLabel?: InternationalString;
  project?: { id: string };
  background?: string;
  data?: Project;
  radius?: string;
}

export function SingleProject(props: SingleProjectProps) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const { data, project, customButtonLabel } = props;
  const accessibleTextColor = useAccessibleColor(props.background || '#eeeeee');
  const radius = props.radius ? parseInt(props.radius, 10) : undefined;

  if (!project || !data) {
    return null;
  }

  return (
    <ObjectContainer $background={props.background} $color={accessibleTextColor} $radius={radius}>
      <LocaleString as={Heading3}>{data.label || { en: ['...'] }}</LocaleString>
      <LocaleString as={Subheading3}>{data.summary || { en: ['...'] }}</LocaleString>
      <Button $primary as={Link} to={createLink({ projectId: project.id })}>
        {customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('Go to project')}
      </Button>
      <ProjectStatus status={data.status} template={data.template} />
    </ObjectContainer>
  );
}

blockEditorFor(SingleProject, {
  label: 'Single project',
  type: 'SingleProject',
  defaultProps: {
    customButtonLabel: '',
    project: null,
    background: null,
    radius: null,
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
    background: { type: 'color-field', label: 'Background color', defaultValue: '#eeeeee' },
    radius: { type: 'text-field', label: 'Border radius', defaultValue: '' },
    project: {
      label: 'Project',
      type: 'project-explorer',
    },
  },
  requiredContext: [],
  anyContext: [],
});
