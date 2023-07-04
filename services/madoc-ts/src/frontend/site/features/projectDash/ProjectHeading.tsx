import React from 'react';
import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-for';
import { Heading1, Subheading1 } from '../../../shared/typography/Heading1';
import { LocaleString } from '../../../shared/components/LocaleString';
import { useProject } from '../../hooks/use-project';
import styled from 'styled-components';
import { StartContributingButton } from '../sharedFeatures/StartContributingButton';

const ProjectHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  position: relative;
  min-width: 100%;
  height: 280px;
  &[data-full-width='true'] {
    margin: 0 -2em;
    width: auto;
  }

  button {
    background-color: black;
    border-color: black;
    position: absolute;
    bottom: 2em;
  }
`;

const ProjectHeadingOverlay = styled.div`
  background-color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  width: 50%;
  height: 280px;
`;
const ProjectTitle = styled.div`
  padding-right: 5em;
`;

export const ProjectHeading: React.FC<{
  headerImage?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  fullWidth?: boolean;
  imageHeight?: string;
  showContributingButton?: boolean;
}> = ({ headerImage, fullWidth, imageHeight = 280, showContributingButton = true }) => {
  const { data: project } = useProject();

  if (!project) {
    return null;
  }

  return (
    <ProjectHeadingContainer
      style={{ backgroundImage: `url("${headerImage?.image}")`, height: `${imageHeight}px` }}
      data-full-width={fullWidth}
    >
      <ProjectHeadingOverlay style={{ height: `${imageHeight}px` }}>
        <ProjectTitle>
          <LocaleString as={Heading1}>{project.label}</LocaleString>
          <LocaleString as={Subheading1}>{project.summary}</LocaleString>
        </ProjectTitle>

        {showContributingButton && <StartContributingButton />}
      </ProjectHeadingOverlay>
    </ProjectHeadingContainer>
  );
};

blockEditorFor(ProjectHeading, {
  type: 'default.ProjectHeading',
  label: 'Project heading',
  anyContext: ['project'],
  requiredContext: ['project'],
  defaultProps: {
    headerImage: null,
    fullWidth: false,
    imageHeight: 280,
    showContributingButton: true,
  },
  editor: {
    headerImage: { label: 'Background image', type: 'madoc-media-explorer' },
    fullWidth: { label: 'Full width', type: 'checkbox-field', inlineLabel: 'Show image full width' },
    imageHeight: { label: 'Image height', type: 'text-field' },
    showContributingButton: {
      label: 'Start contributing button',
      type: 'checkbox-field',
      inlineLabel: 'Show start Contributing button',
    },
  },
});
