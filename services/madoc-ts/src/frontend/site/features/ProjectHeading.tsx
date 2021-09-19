import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { Heading1, Subheading1 } from '../../shared/typography/Heading1';
import { LocaleString } from '../../shared/components/LocaleString';
import { useProject } from '../hooks/use-project';

export const ProjectHeading: React.FC = () => {
  const { data: project } = useProject();

  if (!project) {
    return null;
  }

  return (
    <>
      <LocaleString as={Heading1}>{project.label}</LocaleString>
      <LocaleString as={Subheading1}>{project.summary}</LocaleString>
    </>
  );
};

blockEditorFor(ProjectHeading, {
  type: 'default.ProjectHeading',
  label: 'Project heading',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});
