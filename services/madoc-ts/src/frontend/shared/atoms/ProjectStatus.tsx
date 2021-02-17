import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const projectStatusColors = [
  // Paused
  '#fcdec1',
  // Active
  '#eee',
  // Published
  '#c2f3c4',
  // Archived
  '#d79f9f',
];

export const ProjectStatusContainer = styled.div<{ $status?: number }>`
  background: ${props => (typeof props.$status !== 'undefined' ? projectStatusColors[props.$status] : false) || '#eee'};
  padding: 0.5em;
  color: #4f4f4f;
  margin: 1em 0;
`;

export const ProjectStatus: React.FC<{ status?: number }> = ({ status }) => {
  const { t } = useTranslation();
  return (
    <>
      {status === 0 ? (
        <ProjectStatusContainer $status={0}>
          {t('help__project_paused', { defaultValue: 'This project is paused, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 2 ? (
        <ProjectStatusContainer $status={2}>
          {t('help__project_published', { defaultValue: 'This project is published' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 3 ? (
        <ProjectStatusContainer $status={3}>
          {t('help__project_archived', { defaultValue: 'This project is archived, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
    </>
  );
};

export const ProjectContainer = styled.div<{ $status?: number }>`
  background: #eee;
  margin-bottom: 20px;
  padding: 20px 20px 40px;
`;
