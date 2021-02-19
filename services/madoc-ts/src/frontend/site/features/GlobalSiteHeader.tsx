import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { ErrorMessage } from '../../shared/atoms/ErrorMessage';
import { GlobalStyles } from '../../shared/atoms/GlobalStyles';
import { LanguageSwitcher } from '../../shared/atoms/LanguageSwitcher';
import { useApi, useIsApiRestarting } from '../../shared/hooks/use-api';
import { useSite } from '../../shared/hooks/use-site';
import { HrefLink } from '../../shared/utility/href-link';

const SiteHeader = styled.div`
  max-width: 1440px;
  width: 100%;
  padding: 0 2em;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  background: #fff;
`;

const SiteDetails = styled.div`
  align-self: flex-start;
  text-decoration: none;
  flex: 1 1 0px;
`;

const SiteTitle = styled.a`
  text-decoration: none;
  letter-spacing: -2px;
  color: #363453;
  font-size: 1em;
`;

const GlobalSearchContainer = styled.div`
  flex: 1;
  margin-right: 20px;
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
  border: 2px solid #c2c2c2;
  border-right: none;
  border-radius: 0;
  width: 100%;

  &:focus {
    border-color: #333;
    outline: none;
  }
`;

const GlobalSearchButton = styled.button`
  font-size: 0.9em;
  padding: 0.2em 1em;
  background: #333;
  color: #fff;
  border: 2px solid #333;
`;

export const GlobalSiteHeader: React.FC = () => {
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
      <SiteHeader>
        <SiteDetails>
          <SiteTitle as={HrefLink} href={`/`} className="site-title">
            <h1>
              <span className="title">{site.title}</span>
            </h1>
          </SiteTitle>
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
    </>
  );
};
