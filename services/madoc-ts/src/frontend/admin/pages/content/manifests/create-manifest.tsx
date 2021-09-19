import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InternationalString } from '@hyperion-framework/types';
import { ErrorMessage } from '../../../../shared/callouts/ErrorMessage';
import { useApi } from '../../../../shared/hooks/use-api';
import { useHistory } from 'react-router-dom';
import { useMutation } from 'react-query';
import { CreateManifest as CreateManifestType } from '../../../../../types/schemas/create-manifest';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { GridContainer, HalfGird } from '../../../../shared/layout/Grid';
import { Heading3, Subheading3 } from '../../../../shared/typography/Heading3';
import { Button, SmallButton } from '../../../../shared/navigation/Button';
import { Input, InputContainer, InputLabel } from '../../../../shared/form/Input';
import { PreviewManifest } from '../../../molecules/PreviewManifest';
import { AdminHeader } from '../../../molecules/AdminHeader';
import { WidePage } from '../../../../shared/layout/WidePage';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';

export const CreateManifest: React.FC = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation();
  const [manifestToAdd, setManifestToAdd] = useState<{ label: InternationalString }>({
    label: { [language || 'none']: [''] },
  });
  const [isCreating, setIsCreating] = useState(false);
  const api = useApi();
  const history = useHistory();
  const query = useLocationQuery<{ manifest?: string }>();
  const [importedManifestId, setImportedManifestId] = useState<string | undefined>(query.manifest);
  const [error, setError] = useState('');

  const [createManifest] = useMutation(async (manifest: CreateManifestType['manifest']) => {
    setIsCreating(true);

    const response = await api.createManifest(manifest);

    history.push(`/manifests/${response.id}`);
  });

  const [importManifest] = useMutation(async (manifestId: string) => {
    setIsCreating(true);
    const task = await api.importManifest(manifestId);

    history.push(`/tasks/${task.id}`);
  });

  const urlManifest = query.manifest;

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: t('Site admin'), link: '/' },
          { label: t('Manifests'), link: '/manifests' },
          { label: t('Add new manifest'), link: `/import/manifest`, active: true },
        ]}
        title={t('Add new manifest')}
      />
      <WidePage>
        {urlManifest ? (
          <div>
            <Button disabled={isCreating || !!error} onClick={() => importManifest(urlManifest)}>
              {t('Import manifest')}
            </Button>
            <hr />
            {error ? (
              <ErrorMessage>{error}</ErrorMessage>
            ) : (
              <div style={{ background: '#eee', borderRadius: 5, padding: '1em' }}>
                <VaultProvider>
                  <PreviewManifest
                    id={urlManifest}
                    setInvalid={isInvalid => {
                      if (isInvalid) {
                        setError('Invalid manifest');
                      } else {
                        setError('');
                      }
                    }}
                  />
                </VaultProvider>
              </div>
            )}
          </div>
        ) : (
          <GridContainer>
            <HalfGird>
              <Heading3>Import existing</Heading3>
              <Subheading3>Import a manifest using a URL pointing to an existing IIIF manifest.</Subheading3>
              <InputContainer>
                <InputLabel>Manifest URL</InputLabel>
                <Input type="text" onChange={e => setImportedManifestId(e.currentTarget.value)} />
              </InputContainer>
              <SmallButton
                disabled={isCreating}
                onClick={() => {
                  history.push(`/import/manifest?manifest=${importedManifestId}`);
                }}
              >
                Import
              </SmallButton>
            </HalfGird>
          </GridContainer>
        )}
      </WidePage>
    </>
  );
};
