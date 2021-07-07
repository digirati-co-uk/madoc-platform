import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useProject } from '../../site/hooks/use-project';
// @ts-ignore
import makeColorAccessible from 'make-color-accessible';
import { useProjectTemplate } from '../hooks/use-project-template';

export const projectStatusColors = [
  // Paused
  '#fcdec1',
  // Active
  '#eee',
  // Published
  '#c2f3c4',
  // Archived
  '#d79f9f',
  // Prepared
  '#4265e9',
];

export const ProjectStatusContainer = styled.div<{ $status?: number; $color?: string }>`
  ${props => {
    const background = props.$color
      ? props.$color
      : (typeof props.$status !== 'undefined' ? projectStatusColors[props.$status] : false) || '#eee';
    const color = makeColorAccessible('#000', { background });

    return css`
      background: ${background};
      color: ${color};
    `;
  }};
  padding: 0.5em;
  margin: 1em 0;
`;

export type ProjectStatusMap = { [status: number]: { label?: string; action?: string; info?: string; color?: string } };

export const ProjectStatus: React.FC<{ status?: number; statusMapping?: ProjectStatusMap; template?: string }> = ({
  status: customStatus,
  statusMapping: _statusMapping,
  template,
}) => {
  const { data: project } = useProject();
  const { t } = useTranslation();
  const resolvedTemplate = useProjectTemplate(project?.template || template);
  const statusMapping = _statusMapping || resolvedTemplate?.configuration?.status?.statusMap || {};

  if (!project && typeof customStatus === 'undefined') {
    return null;
  }

  const status = project ? project.status : customStatus;

  return (
    <>
      {status === 0 ? (
        <ProjectStatusContainer $status={0} $color={statusMapping[0]?.color}>
          {statusMapping[0] && statusMapping[0].info
            ? statusMapping[0].info
            : t('help__project_paused', { defaultValue: 'This project is paused, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 2 ? (
        <ProjectStatusContainer $status={2} $color={statusMapping[2]?.color}>
          {statusMapping[2] && statusMapping[2].info
            ? statusMapping[2].info
            : t('help__project_published', { defaultValue: 'This project is published' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 3 ? (
        <ProjectStatusContainer $status={3} $color={statusMapping[3]?.color}>
          {statusMapping[3] && statusMapping[3].info
            ? statusMapping[3].info
            : t('help__project_archived', { defaultValue: 'This project is archived, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 4 ? (
        <ProjectStatusContainer $status={4} $color={statusMapping[4]?.color}>
          {statusMapping[4] && statusMapping[4].info
            ? statusMapping[4].info
            : t('help__project_prepare', { defaultValue: 'This project is being prepared, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
    </>
  );
};

blockEditorFor(ProjectStatus, {
  type: 'default.ProjectStatus',
  label: 'Project status',
  anyContext: ['project'],
  requiredContext: ['project'],
  editor: {},
});

export const ProjectContainer = styled.div<{ $status?: number }>`
  background: #eee;
  margin-bottom: 20px;
  padding: 20px 20px 40px;
`;
