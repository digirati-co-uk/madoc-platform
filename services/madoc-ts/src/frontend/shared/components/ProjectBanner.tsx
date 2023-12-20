import React from 'react';
import styled from 'styled-components';
import { ProjectListItem } from '../../../types/schemas/project-list-item';
import { ProjectStatus } from '../atoms/ProjectStatus';
import { useBase64 } from '../hooks/use-base64';
import { useProjectTemplate } from '../hooks/use-project-template';
import { useSite } from '../hooks/use-site';
import { Button, ButtonRow } from '../navigation/Button';
import { HrefLink } from '../utility/href-link';
import { LocaleString } from './LocaleString';

const ProjectBannerContainer = styled.div`
  background: #ffffff;
  border: 1px solid #c9c9c9;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.13);
  border-radius: 5px;
  padding: 1em 1.5em;
  display: flex;
  margin-bottom: 1.5em;
`;

const ProjectBannerTitle = styled(LocaleString)`
  display: block;
  font-size: 1.4em;
  font-weight: bold;
  margin-bottom: 0.2em;
`;

const ProjectBannerSummary = styled(LocaleString)`
  display: block;
  font-size: 0.85em;
  color: #999;
`;

const ProjectBannerMetadata = styled.div`
  flex: 1 1 0px;
  margin-right: 1em;
`;

const ProjectBannerActions = styled.div`
  padding: 1em;
  a {
    color: #5a78e8;
    display: block;
    margin-bottom: 0.5em;
    font-size: 0.8em;
  }
`;

const ProjectBannerImage = styled.div`
  text-align: center;
  margin-right: 1em;
  img {
    width: 50px;
  }
  margin-bottom: 0.5em;
`;

const ProjectBannerTitleContainer = styled.div`
  display: flex;
`;

const ProjectBannerTitleInner = styled.div`
  flex: 1 1 0px;
`;

export const ProjectBanner: React.FC<{ project: ProjectListItem; admin?: boolean; status?: boolean }> = ({
  project,
  admin,
  status,
}) => {
  const site = useSite();
  const { encode } = useBase64();
  const template = useProjectTemplate(project.template || 'custom');

  return (
    <ProjectBannerContainer>
      <ProjectBannerMetadata>
        <ProjectBannerTitleContainer>
          {template && template.metadata.thumbnail ? (
            <ProjectBannerImage>
              <img
                alt={template.metadata.label}
                src={`data:image/svg+xml;base64,${encode(template.metadata.thumbnail)}`}
              />
            </ProjectBannerImage>
          ) : null}
          <ProjectBannerTitleInner>
            <ProjectBannerTitle>{project.label}</ProjectBannerTitle>
            <ProjectBannerSummary>{project.summary}</ProjectBannerSummary>
            {template ? <ProjectBannerSummary>{template.metadata.label}</ProjectBannerSummary> : null}
          </ProjectBannerTitleInner>
        </ProjectBannerTitleContainer>
        {status ? <ProjectStatus status={project.status} template={project.template} /> : null}
        <ButtonRow>
          <Button $primary as={HrefLink} href={`/projects/${admin ? project.id : project.slug}`}>
            Go to project
          </Button>
        </ButtonRow>
      </ProjectBannerMetadata>
      {admin ? (
        <ProjectBannerActions>
          <div>
            <HrefLink href={`/projects/${project.id}/content`}>Add content to project</HrefLink>
          </div>
          <div>
            <a href={`/s/${site.slug}/projects/${project.slug}`}>See project on site</a>
          </div>
          <div>
            <HrefLink href={`/projects/${project.id}/configuration`}>Edit project settings</HrefLink>
          </div>
        </ProjectBannerActions>
      ) : null}
    </ProjectBannerContainer>
  );
};
