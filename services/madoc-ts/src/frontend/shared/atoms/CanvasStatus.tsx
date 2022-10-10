import styled, { css } from 'styled-components';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/use-api';
import { useUser } from '../hooks/use-site';

const CanvasStatusBackground = styled.div<{ $floating?: boolean }>`
  height: 10px;

  ${props =>
    props.$floating &&
    css`
      position: absolute;
      z-index: 3;
      left: 10px;
      right: 10px;
      bottom: 10px;
      border-radius: 3px;
      box-shadow: 0 1px 3px rgb(0 0 0 / 30%);
    `}
`;

const CanvasStatusItem = styled.div<{ $status: number }>`
  height: 10px;
  ${props => {
    switch (props.$status) {
      case 1:
        return css`
          background: #5b82d8;
          width: 10%;
        `;
      case 2:
        return css`
          background: #bf7b47;
          width: 65%;
        `;
      case 3:
        return css`
          background: #6da961;
          width: 100%;
        `;
    }
  }}
`;

export const CanvasStatus: React.FC<{ status: number; floating?: boolean }> = ({ status, floating }) => {
  const { t } = useTranslation();
  const api = useApi();
  const user = useUser();
  const tooltip =
    status === 3
      ? t('Completed')
      : status === 2 || status === 1
      ? t('You are currently working on this')
      : t('Available');

  return (
    <>
      <CanvasStatusBackground $floating={floating}>
        <CanvasStatusItem data-tip={tooltip} $status={status} />
      </CanvasStatusBackground>
      {api.getIsServer() || !user || user.site_role === 'viewer' ? null : (
        <ReactTooltip place="bottom" type="dark" effect="solid" />
      )}
    </>
  );
};
