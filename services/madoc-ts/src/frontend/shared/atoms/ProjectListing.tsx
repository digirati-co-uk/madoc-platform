import React from 'react';
import styled from 'styled-components';
import { LocaleString } from '../components/LocaleString';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';
import { HrefLink } from '../utility/href-link';
import { ProjectSnippet } from '../../../types/schemas/project-snippet';

const ProjectListingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ProjectListingTitle = styled.div`
  font-size: 1.2em;
  margin-bottom: 0.5em;
  a {
    text-decoration: none;
  }
`;

const ProjectListingDescription = styled.div`
  font-size: 0.85em;
  margin-bottom: 1em;
`;

const ProjectListingItem = styled.div`
  background: #eee;
  padding: 1em;
  & ~ & {
    margin-top: 1em;
  }
`;

export const ProjectListing: React.FC<{
  projects: ProjectSnippet[];
  onContribute?: (id: string | number) => void;
  showLink?: boolean;
}> = ({ projects, onContribute, showLink }) => {
  const { t } = useTranslation();

  return (
    <ProjectListingContainer>
      {projects.map(project => (
        <ProjectListingItem key={project.id}>
          <ProjectListingTitle>
            <HrefLink href={`/projects/${project.id}`}>
              <LocaleString>{project.label}</LocaleString>
            </HrefLink>
          </ProjectListingTitle>
          <ProjectListingDescription>
            <LocaleString>{project.summary}</LocaleString>
          </ProjectListingDescription>
          {onContribute ? <Button onClick={() => onContribute(project.id)}>{t('Contribute')}</Button> : null}
          {showLink ? (
            <Button as={HrefLink} href={`/projects/${project.id}`}>
              {t('Go to project')}
            </Button>
          ) : null}
        </ProjectListingItem>
      ))}
    </ProjectListingContainer>
  );
};
