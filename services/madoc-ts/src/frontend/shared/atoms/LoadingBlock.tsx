import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Spinner } from '../icons/Spinner';

const LoadingBlockContainer = styled.div`
  text-align: center;
  padding: 10em 0;
`;

const LoadingSpinner = styled(Spinner)`
  stroke: #000;
  font-size: 2em;
  display: block;
  margin: 1em auto;
`;

export const LoadingBlock: React.FC = () => {
  const { t } = useTranslation();
  return (
    <LoadingBlockContainer>
      <LoadingSpinner />
      {t('Loading')}
    </LoadingBlockContainer>
  );
};
