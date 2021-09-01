import React, { useState } from 'react';
import { AdminHeader } from '../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { WidePage } from '../../../shared/atoms/WidePage';
import { Button, useApi } from '../../../..';
import { useHistory } from 'react-router-dom';
import { Input, InputContainer, InputLabel } from '../../../shared/atoms/Input';
import { ExpandGrid, GridContainer } from '../../../shared/atoms/Grid';

export const GenerateApiKey: React.FC = () => {
  const api = useApi();
  const history = useHistory();
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [scopes, setScopes] = useState<string[]>([]);
  const [scopeInput, setScopeInput] = useState<string>('');

  const generateKey = async () => {
    await api.generateApiKey({ label, clientId, clientSecret, scopes })
  };

  const addScope = () => {
    setScopes([...scopes, scopeInput]);
    setScopeInput('');
  };

  return (
    <>
      <AdminHeader title={t('Generate API Keys')} breadcrumbs={[{ label: 'Site admin', link: '/' }]} />
      <WidePage>
        <form onSubmit={e => {
          e.preventDefault();
          addScope();
        }}>
          <InputContainer>
            <InputLabel>{t('Scopes')}</InputLabel>
            <ul>
              {scopes.map((scope, i) => (
                <li key={i}>{scope}</li>
              ))}
            </ul>
            <GridContainer>
              <ExpandGrid>
                <Input
                  placeholder={t('Enter scope')}
                  type="text"
                  value={scopeInput}
                  onChange={e => setScopeInput(e.currentTarget.value)}
                />
              </ExpandGrid>
            </GridContainer>
          </InputContainer>
          <Button type="submit">
            {t('Add scope')}
          </Button>
        </form>
        <form onSubmit={e => {
          e.preventDefault();
          generateKey()
            .then(r => history.push('/'));
        }}>
          <InputContainer>
            <InputLabel>{t('Label')}</InputLabel>
            <GridContainer>
              <ExpandGrid>
                <Input
                  placeholder={t('Enter label')}
                  type="text"
                  value={label}
                  onChange={e => setLabel(e.currentTarget.value)}
                />
              </ExpandGrid>
            </GridContainer>
          </InputContainer>
          <InputContainer>
            <InputLabel>{t('Client ID')}</InputLabel>
            <GridContainer>
              <ExpandGrid>
                <Input
                  placeholder={t('Enter client ID')}
                  type="text"
                  value={clientId}
                  onChange={e => setClientId(e.currentTarget.value)}
                />
              </ExpandGrid>
            </GridContainer>
          </InputContainer>
          <InputContainer>
            <InputLabel>{t('Client secret')}</InputLabel>
            <GridContainer>
              <ExpandGrid>
                <Input
                  placeholder={t('Enter client secret')}
                  type="text"
                  value={clientSecret}
                  onChange={e => setClientSecret(e.currentTarget.value)}
                />
              </ExpandGrid>
            </GridContainer>
          </InputContainer>
          <Button $primary $inlineInput type="submit">
            {t('Generate API key')}
          </Button>
        </form>
      </WidePage>
    </>
  )
};
