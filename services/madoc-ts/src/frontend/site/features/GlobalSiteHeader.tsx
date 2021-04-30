import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { GlobalStyles } from '../../shared/atoms/GlobalStyles';
import { useApi, useIsApiRestarting } from '../../shared/hooks/use-api';
import { useSite } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';
import { themeVariable } from '../../themes/helpers/themeVariable';
import { maxWidth } from '../variables/global';

const headerBackground = themeVariable('header', 'headerBackground', {
  default: '#fff',
  dark: '#444',
  midnight: '#000',
});

const globalBackground = themeVariable('header', 'globalBackground', {
  default: '#fff',
  dark: '#222',
  midnight: '#000',
});

const headerText = themeVariable('header', 'headerText', {
  default: '#363453',
  dark: '#fff',
  midnight: '#fff',
});

const searchBorder = themeVariable('header', 'searchBorder', {
  default: '2px solid #c2c2c2',
  dark: '2px solid #000',
  midnight: '2px solid #000',
});

const searchBorderFocusColor = themeVariable('header', 'searchBorderFocusColor', {
  default: '#4B67E1',
  midnight: '#4B67E1',
  dark: '#4B67E1',
});

const SiteHeader = styled.div`
  max-width: ${maxWidth};
  width: 100%;
  padding: 0 2em;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: ${headerBackground};
`;

const SiteDetails = styled.div`
  align-self: flex-start;
  text-decoration: none;
  flex: 1 1 0px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const SiteTitle = styled.a`
  text-decoration: none;
  letter-spacing: -2px;
  color: ${headerText};
  font-size: 1em;
  margin-right: 2em;
`;

const GlobalSearchContainer = styled.div`
  flex: 1;
  margin-right: 0;
  width: 100%;
  max-width: 20em;
`;

const GlobalSearchForm = styled.form`
  display: flex;
  margin-bottom: 0;
`;

const GlobalSearchInput = styled.input`
  font-size: 0.9em;
  padding: 0.5em;
  border: ${searchBorder};
  border-right: none;
  border-radius: 0;
  width: 100%;

  &:focus {
    border-color: ${searchBorderFocusColor};
    outline: none;
  }
`;

const GlobalSearchButton = styled.button`
  font-size: 0.9em;
  padding: 0.2em 1em;
  background: #333;
  color: #fff;
  border: 2px solid #333;
  &:focus {
    outline: none;
    border-color: ${searchBorderFocusColor};
  }
`;

const SiteMenuContainer = styled.div``;

const SiteHeaderBackground = styled.div`
  background: ${globalBackground};
`;

export const GlobalSiteHeader: React.FC<{ menu?: any }> = ({ menu }) => {
  const site = useSite();
  const api = useApi();
  const restarting = useIsApiRestarting(api);
  const history = useHistory();
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  return (
    <>
      {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
      <GlobalStyles />
      <SiteHeaderBackground>
        <SiteHeader>
          <SiteDetails>
            <SiteTitle as={HrefLink} href={`/`} className="site-title">
              <h1>
                <span className="title">{site.title}</span>
              </h1>
            </SiteTitle>
            <SiteMenuContainer>{menu}</SiteMenuContainer>
          </SiteDetails>
          <GlobalSearchContainer>
            <GlobalSearchForm
              onSubmit={e => {
                e.preventDefault();
                history.push(`/search?fulltext=${query}`);
                setQuery('');
              }}
            >
              <GlobalSearchInput
                type="text"
                name="fulltext"
                value={query}
                onChange={e => {
                  setQuery(e.target.value);
                }}
                placeholder={t('Search')}
              />
              <GlobalSearchButton type="submit">{t('Search')}</GlobalSearchButton>
            </GlobalSearchForm>
          </GlobalSearchContainer>
        </SiteHeader>
      </SiteHeaderBackground>
    </>
  );
};
