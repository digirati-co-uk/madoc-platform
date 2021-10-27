import styled, { css } from 'styled-components';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import { useTranslation } from 'react-i18next';
import { useApi } from '../hooks/use-api';
import { useUser } from '../hooks/use-site';

const CanvasStatusBackground = styled.div`
  background: #ced8ea;
  height: 10px;
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

export const CanvasStatus: React.FC<{ status: number }> = ({ status }) => {
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
      <CanvasStatusBackground>
        <CanvasStatusItem data-tip={tooltip} $status={status} />
      </CanvasStatusBackground>
      {api.getIsServer() || !user || user.site_role === 'viewer' ? null : (
        <ReactTooltip place="bottom" type="dark" effect="solid" />
      )}
    </>
  );
};
