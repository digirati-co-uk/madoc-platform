import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { InternationalString } from '@hyperion-framework/types';
import { useApi } from '../../../hooks/use-api';
import { useHistory } from 'react-router-dom';
import { useLocationQuery } from '../../../utility';
import { useMutation } from 'react-query';
import { CreateManifest as CreateManifestType } from '../../../../../types/schemas/create-manifest';
import { ContextHeading, Header } from '../../../atoms/Header';
import { VaultProvider } from '@hyperion-framework/react-vault';
import { GridContainer, HalfGird } from '../../../atoms/Grid';
import { Heading3, Subheading3 } from '../../../atoms/Heading3';
import { MetadataEditor } from '../../../molecules/MetadataEditor';
import { Button, SmallButton } from '../../../atoms/Button';
import { Input, InputContainer, InputLabel } from '../../../atoms/Input';
import { PreviewManifest } from '../../../molecules/PreviewManifest';

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
      <Header>
        <ContextHeading>{t('Import manifest')}</ContextHeading>
      </Header>
      {urlManifest ? (
        <div>
          <Button disabled={isCreating} onClick={() => importManifest(urlManifest)}>
            {t('Import manifest')}
          </Button>
          <hr />
          <div style={{ background: '#eee', borderRadius: 5, padding: '1em' }}>
            <VaultProvider>
              <PreviewManifest id={urlManifest} />
            </VaultProvider>
          </div>
        </div>
      ) : (
        <GridContainer>
          <HalfGird>
            <Heading3>{t('Create new')}</Heading3>
            <Subheading3>{t('Add a new empty manifest and start adding IIIF manifests to it.')}</Subheading3>
            <MetadataEditor
              disabled={isCreating}
              fields={manifestToAdd.label}
              onSave={ret => setManifestToAdd({ label: ret.toInternationalString() })}
              metadataKey="label"
              availableLanguages={['en', 'es', 'fr', 'de']}
            />
            <SmallButton disabled={manifestToAdd && isCreating} onClick={() => createManifest(manifestToAdd)}>
              Create manifest
            </SmallButton>
          </HalfGird>
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
    </>
  );
};
