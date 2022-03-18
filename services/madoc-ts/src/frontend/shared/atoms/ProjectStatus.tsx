import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { useProject } from '../../site/hooks/use-project';
import { useProjectTemplate } from '../hooks/use-project-template';
import { makeColorAccessible } from '../utility/make-color-accessible';

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
    const color = makeColorAccessible(background);

    return css`
      background: ${background};
      color: ${color};
    `;
  }};
  padding: 0.5em;
  margin: 1em 0;
`;

export const getStatusMapItem = (map: any, key: number | string): ProjectStatusMapItem | undefined =>
  map ? map[Number(key)] : undefined;

export type ProjectStatusMapItem = { label?: string; action?: string; info?: string; color?: string };
export type ProjectStatusMap = { [status: number]: ProjectStatusMapItem };

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
        <ProjectStatusContainer $status={0} $color={getStatusMapItem(statusMapping, 0)?.color}>
          {getStatusMapItem(statusMapping, 0)?.info
            ? getStatusMapItem(statusMapping, 0)?.info
            : t('help__project_paused', { defaultValue: 'This project is paused, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 2 ? (
        <ProjectStatusContainer $status={2} $color={getStatusMapItem(statusMapping, 2)?.color}>
          {getStatusMapItem(statusMapping, 2)?.info
            ? getStatusMapItem(statusMapping, 2)?.info
            : t('help__project_published', { defaultValue: 'This project is published' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 3 ? (
        <ProjectStatusContainer $status={3} $color={getStatusMapItem(statusMapping, 3)?.color}>
          {getStatusMapItem(statusMapping, 3)?.info
            ? getStatusMapItem(statusMapping, 3)?.info
            : t('help__project_archived', { defaultValue: 'This project is archived, only you can see it' })}
        </ProjectStatusContainer>
      ) : null}
      {status === 4 ? (
        <ProjectStatusContainer $status={4} $color={getStatusMapItem(statusMapping, 4)?.color}>
          {getStatusMapItem(statusMapping, 4)?.info
            ? getStatusMapItem(statusMapping, 4)?.info
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

