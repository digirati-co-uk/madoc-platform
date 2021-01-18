import { Revisions, RoundedCard } from '@capture-models/editor';
import { CaptureModel } from '@capture-models/types';
import React, { useEffect, useMemo, useState } from 'react';
import { createRevisionFromDocument } from '../../../shared/utility/create-revision-from-document';
import { WidePage } from '../../../shared/atoms/WidePage';
import { RevisionTopLevel } from '../../../shared/caputre-models/RevisionTopLevel';
import { useApi } from '../../../shared/hooks/use-api';
import { apiHooks } from '../../../shared/hooks/use-api-query';
import { AdminHeader } from '../../molecules/AdminHeader';
import { siteConfigurationModel } from '../../../shared/configuration/site-config';
import { hydrateCompressedModel, serialiseCaptureModel } from '@capture-models/helpers';

function postProcessConfiguration(config: any) {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  return config;
}

export const ViewDocument: React.FC<{
  onSave?: (revision: any) => void;
  onChange?: (revision: CaptureModel['document']) => void;
  allowEdits?: boolean;
}> = ({ onSave, onChange, allowEdits = true }) => {
  const api = useApi();

  const isPreviewing = Revisions.useStoreState(s => s.isPreviewing);
  const revision = Revisions.useStoreState(s => s.currentRevision);
  const setIsPreviewing = Revisions.useStoreActions(a => a.setIsPreviewing);

  useEffect(() => {
    if (onChange && revision) {
      onChange(revision.document);
    }
  }, [onChange, revision]);

  useEffect(() => {
    if (isPreviewing && onSave) {
      onSave(revision ? postProcessConfiguration(serialiseCaptureModel(revision.document)) : null);
      setIsPreviewing(false);
    }
  }, [revision, isPreviewing, onSave, setIsPreviewing]);
  if (isPreviewing) {
    return null;
  }

  return (
    <>
      {api.getIsServer() ? null : (
        <RevisionTopLevel
          onSaveRevision={async req => {
            // no-op
          }}
          skipThankYou={true}
          instructions={''}
          allowEdits={allowEdits}
          allowNavigation={false}
          readOnly={false}
        />
      )}
    </>
  );
};

export const EditSiteConfiguration: React.FC<{ onSave: (revision: any) => Promise<void> | void }> = ({ onSave }) => {
  const { data: value } = apiHooks.getSiteConfiguration(() => []);

  const rev = useMemo(() => {
    if (!value) {
      return undefined;
    }
    const document = hydrateCompressedModel({
      __meta__: siteConfigurationModel as any,
      ...value,
    });

    return createRevisionFromDocument(document);
  }, [value]);

  return rev ? (
    <Revisions.Provider captureModel={rev.model} initialRevision={rev.revisionId}>
      <ViewDocument
        onSave={revision => {
          onSave(revision);
        }}
      />
    </Revisions.Provider>
  ) : null;
};

export const SiteConfiguration: React.FC = () => {
  const [siteConfig, setSiteConfig] = useState(false);
  const api = useApi();

  return (
    <>
      <AdminHeader
        title="Site configuration"
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Configure site', link: '/configure/site' },
        ]}
      />
      <WidePage>
        <div style={{ maxWidth: 600 }}>
          {siteConfig ? (
            <EditSiteConfiguration
              onSave={async revision => {
                setSiteConfig(false);
                await api.saveSiteConfiguration(revision);
              }}
            />
          ) : (
            <>
              <RoundedCard
                label="Edit site configuration"
                interactive
                onClick={() => {
                  setSiteConfig(true);
                }}
              >
                Change the configuration for the site - this will be overridden by configuration on a project.
              </RoundedCard>
            </>
          )}
        </div>
      </WidePage>
    </>
  );
};
