import React, { useRef } from 'react';
import { useMutation } from 'react-query';
import { UserInformationRequest } from '../../../extensions/site-manager/types';
import { SuccessMessage } from '../../shared/callouts/SuccessMessage';
import {
  EditorShorthandCaptureModelRef,
  EditShorthandCaptureModel,
} from '../../shared/capture-models/EditorShorthandCaptureModel';
import { useApi } from '../../shared/hooks/use-api';
import { useData } from '../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';

export function UserSettings() {
  const { data, refetch, updatedAt } = useData(UserSettings);
  const ref = useRef<EditorShorthandCaptureModelRef>(null);
  const visibilityRef = useRef<EditorShorthandCaptureModelRef>(null);
  const api = useApi();

  const [saveSettings, saveSettingsStatus] = useMutation(async () => {
    const fields: UserInformationRequest['fields'] = {};
    const extraVisibility: UserInformationRequest['extraVisibility'] = {};
    const userInfo = ref.current?.getData();
    const visibility = visibilityRef.current?.getData();
    for (const key of Object.keys(visibility)) {
      if (userInfo[key]) {
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

  if (!data) {
    return null;
  }

  return (
    <div key={updatedAt}>
      <h2>Profile</h2>
      {saveSettingsStatus.isSuccess ? <SuccessMessage>Settings saved</SuccessMessage> : null}
      {data.model ? <EditShorthandCaptureModel ref={ref} template={data.model} fullDocument /> : null}
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
