import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { themeVariable } from '../../themes/helpers/themeVariable';

const background = themeVariable('footer', 'background', {
  dark: '#333',
  light: '#eee',
});

const containerBackground = themeVariable('footer', 'containerBackground', {
  dark: '#111',
  light: '#eee',
});

const color = themeVariable('footer', 'color', {
  light: '#999',
  dark: '#fff',
});

const StyledGlobalFooter = styled.div`
  background: ${background};
  padding: 3em;
  max-width: 1440px;
  color: ${color};
  text-align: center;
  margin: 0 auto;
`;

const GlobalFooterContainer = styled.div`
  background: ${containerBackground};
`;

export const GlobalFooter: React.FC = () => {
  const { t } = useTranslation();
  return (
    <GlobalFooterContainer>
      <StyledGlobalFooter>{t('Powered by Madoc')}</StyledGlobalFooter>
    </GlobalFooterContainer>
  );
};
