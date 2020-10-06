import React from 'react';
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
  margin-top: 1em;
`;

export const ProjectStatus: React.FC<{ status?: number }> = ({ status }) => {
  return (
    <>
      {status === 0 ? (
        <ProjectStatusContainer $status={0}>This project is paused, only you can see it</ProjectStatusContainer>
      ) : null}
      {status === 2 ? <ProjectStatusContainer $status={2}>This project is published</ProjectStatusContainer> : null}
      {status === 3 ? (
        <ProjectStatusContainer $status={3}>This project is archived, only you can see it</ProjectStatusContainer>
      ) : null}
    </>
  );
};

export const ProjectContainer = styled.div<{ $status?: number }>`
  background: #eee;
  margin-bottom: 20px;
  padding: 20px 20px 40px;
`;
