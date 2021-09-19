import styled, { css } from 'styled-components';
import { TickIcon } from '../icons/TickIcon';
import { CloseIcon } from '../icons/CloseIcon';
import * as React from 'react';

export const PermissionList = styled.div`
  display: flex;
  flex-direction: column;
`;

export const PermissionRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5em;
`;

export const PermissionLabel = styled.div<{ $bold?: boolean }>`
  flex: 1 1 0px;
  font-size: 1em;
  margin-left: 1em;
  line-height: 1em;
  ${props =>
    props.$bold &&
    css`
      font-weight: 600;
    `}
`;

export const PermissionIcon = styled.div`
  padding: 0.3em;
`;

export const PermissionTick = styled(TickIcon)``;

export const PermissionCross = styled(CloseIcon)`
  fill: #cd2b2b;
`;

export const UserPermissions: React.FC<{ permissions: Array<{ label: string; value?: boolean }> }> = ({
  permissions,
}) => {
  return (
    <PermissionList>
      {permissions.map((permission, i) => (
        <PermissionRow key={i}>
          <PermissionIcon>{permission.value ? <PermissionTick /> : <PermissionCross />}</PermissionIcon>
          <PermissionLabel $bold={permission.value}>{permission.label}</PermissionLabel>
        </PermissionRow>
      ))}
    </PermissionList>
  );
};
