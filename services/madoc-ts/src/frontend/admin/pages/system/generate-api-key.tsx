import React, { useState } from 'react';
import { useMutation } from 'react-query';
import {
  InputLabel,
  InputContainer,
  Input,
  InputCheckboxContainer,
  InputCheckboxInputContainer,
} from '../../../shared/form/Input';
import { useApi } from '../../../shared/hooks/use-api';
import { useSite } from '../../../shared/hooks/use-site';
import { GridContainer, ExpandGrid } from '../../../shared/layout/Grid';
import { HrefLink } from '../../../shared/utility/href-link';
import { AdminHeader } from '../../molecules/AdminHeader';
import { useTranslation } from 'react-i18next';
import { WidePage } from '../../../shared/layout/WidePage';
import { Button } from '../../../shared/navigation/Button';

const scopeDefinitions = [
  { label: 'Site admin', value: 'site.admin' },
  { label: 'Capture model admin', value: 'model.admin' },
];

export const GenerateApiKey: React.FC = () => {
  const api = useApi();
  const { t } = useTranslation();
  const site = useSite();
  const [label, setLabel] = useState('');
  const [scope, setScope] = useState<string[]>([]);

  const [generateKey, generateKeyStatus] = useMutation(async () => {
    return api.generateApiKey({ label, scope });
  });

  return (
    <>
      <AdminHeader
        title={t('Generate API Keys')}
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'API Keys', link: '/global/api-keys' },
        ]}
      />
      <WidePage>
        {generateKeyStatus.isSuccess ? (
          generateKeyStatus.data ? (
            <div>
              <h3>Key created</h3>
              <p>
                Here is your client id and secret. Your client ID will be visible in Madoc, but you will not see the
                secret again, so make sure to keep it safe.
              </p>

              <h5>Client ID</h5>
              <pre>{generateKeyStatus.data.clientId}</pre>
              <h5>Client Secret</h5>
              <pre>{generateKeyStatus.data.clientSecret}</pre>

              <h4>Exchanging for a JWT</h4>
              <pre>{`POST /s/${site.slug}/auth/api-token HTTP/1.1
Content-Type: application/json
Accept: application/json
{
  "client_id": "${generateKeyStatus.data.clientId}",
  "client_secret": "${generateKeyStatus.data.clientSecret}"
}

`}</pre>

              <Button as={HrefLink} href={`/global/api-keys`}>
                Back to keys
              </Button>
            </div>
          ) : (
            <div>Unknown error</div>
          )
        ) : generateKeyStatus.isError ? (
          <div>Unknown error</div>
        ) : (
          <>
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
              <InputLabel>{t('Scopes')}</InputLabel>
              {scopeDefinitions.map(definition => (
                <InputCheckboxContainer key={definition.value}>
                  <InputCheckboxInputContainer $checked={scope.indexOf(definition.value) !== -1}>
                    <Input
                      type="checkbox"
                      id={definition.value}
                      name={definition.value}
                      checked={scope.indexOf(definition.value) !== -1}
                      onChange={e => {
                        const checked = e.target.checked;
                        setScope(s => {
                          return checked ? [...s, definition.value] : s.filter(sc => sc !== definition.value);
                        });
                      }}
                    />
                  </InputCheckboxInputContainer>
                  <InputLabel htmlFor={definition.value}>
                    {definition.label} ({definition.value})
                  </InputLabel>
                </InputCheckboxContainer>
              ))}
            </InputContainer>
            <Button
              $primary
              type="submit"
              disabled={generateKeyStatus.isLoading || scope.length === 0}
              onClick={() => generateKey()}
            >
              {t('Generate API key')}
            </Button>
          </>
        )}
      </WidePage>
    </>
  );
};
