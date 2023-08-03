import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from 'react-query';
import { UserInformationRequest } from '../../../extensions/site-manager/types';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import {
  EditorShorthandCaptureModelRef,
  EditShorthandCaptureModel,
} from '../../shared/capture-models/EditorShorthandCaptureModel';
import { RevisionRequest } from '../../shared/capture-models/types/revision-request';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { useSite, useUser } from '../../shared/hooks/use-site';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';

export function UserSettings() {
  const { data, refetch, updatedAt } = useData(UserSettings);
  const ref = useRef<EditorShorthandCaptureModelRef>(null);
  const visibilityRef = useRef<EditorShorthandCaptureModelRef>(null);
  const { t } = useTranslation();
  const gFields = data?.model?.properties.gravitar;
  const gField = gFields ? gFields[0] : null;
  const gravitarInit = gField ? (gField as any).value === true : null;
  const [gravitar, setUseGravitar] = React.useState<null | boolean>(gravitarInit);
  const site = useSite();
  const api = useApi();
  const user = useUser();

  const [saveSettings, saveSettingsStatus] = useMutation(async () => {
    try {
      window.scrollTo(0, 0);
    } catch (e) {
      // ignore.
    }

    const fields: UserInformationRequest['fields'] = {};
    const extraVisibility: UserInformationRequest['extraVisibility'] = {};
    const userInfo = ref.current?.getData();
    const visibility = visibilityRef.current?.getData();
    const keys = [...Object.keys(visibility), ...Object.keys(userInfo)];

    for (const key of keys) {
      if (fields[key] || extraVisibility[key]) {
        continue;
      }
      if (typeof userInfo[key] !== 'undefined') {
        fields[key] = {
          value: userInfo[key],
          visibility: visibility?.[key] || 'only-me',
        };
      } else {
        extraVisibility[key] = visibility?.[key] || 'only-me';
      }
    }

    await api.saveSettingsModel({
      fields,
      extraVisibility,
    });

    await refetch();
  });

  const handleChange = (revision: RevisionRequest | null) => {
    if (revision?.document && revision.document.properties.gravitar) {
      const gravitarField = revision.document.properties.gravitar;
      const field = gravitarField[0];
      if (field) {
        setUseGravitar((field as any).value === true);
      }
    }
  };

  if (!data || !user) {
    return null;
  }

  const profileEnabled = !!data.model?.properties.gravitar;

  return (
    <div key={updatedAt}>
      {saveSettingsStatus.isSuccess ? <SuccessMessage $margin>Settings saved</SuccessMessage> : null}

      <h2>Profile</h2>
      {profileEnabled ? (
        <div>
          <div style={{ width: 100, borderRadius: '50%', overflow: 'hidden' }}>
            <img
              src={`/s/${site.slug}/madoc/api/users/${user.id}/image?preview=${gravitar ? 'gravitar' : 'none'}`}
              alt=""
            />
          </div>
          {gravitar ? (
            <a href="https://gravatar.com/connect/" target="_blank" rel="nofollow noreferrer">
              {t('Change avatar')}
            </a>
          ) : null}
        </div>
      ) : null}
      {data.model ? (
        <EditShorthandCaptureModel ref={ref} onChange={handleChange} template={data.model} fullDocument />
      ) : null}
      <h2>Privacy</h2>
      {data.visibilityModel ? (
        <EditShorthandCaptureModel ref={visibilityRef} template={data.visibilityModel} fullDocument />
      ) : null}
      <ButtonRow>
        <Button $primary disabled={saveSettingsStatus.isLoading} onClick={() => saveSettings()}>
          Save changes
        </Button>
      </ButtonRow>
    </div>
  );
}

serverRendererFor(UserSettings, {
  getKey: () => ['user-settings', {}],
  getData: async (key, vars, api, pathname) => {
    return api.getSettingsModel();
  },
});
