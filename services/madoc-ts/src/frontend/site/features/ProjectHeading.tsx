import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Heading1, Subheading1 } from '../../shared/typography/Heading1';
import { LocaleString } from '../../shared/components/LocaleString';
import { useProject } from '../hooks/use-project';
import styled from 'styled-components';
import { StartContributingButton } from './contributor/StartContributingButton';

const ProjectHeadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1em;
`;

const ProjectTitle = styled.div``;

const ProjectImage = styled.div`
  width: 100%;
  height: 100%;
  max-height: 200px;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
  &[data-full-width='true'] {
    margin: 0 -2em;
    width: auto;
  }
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
}> = ({ headerImage, fullWidth, imageHeight = 200, showContributingButton = true }) => {
  const { data: project } = useProject();

  if (!project) {
    return null;
  }

  return (
    <ProjectHeadingContainer>
      <ProjectTitle>
        <LocaleString as={Heading1}>{project.label}</LocaleString>
        <LocaleString as={Subheading1}>{project.summary}</LocaleString>
      </ProjectTitle>

      <ProjectImage data-full-width={fullWidth} style={{ maxHeight: `${imageHeight}px` }}>
        <img src={headerImage?.image} alt={''} />
      </ProjectImage>

      {showContributingButton && <StartContributingButton />}
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
    imageHeight: 200,
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
