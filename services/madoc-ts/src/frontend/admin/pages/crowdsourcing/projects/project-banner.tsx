import { useState } from 'react';
import { useMutation } from 'react-query';
import { MediaExplorer } from '../../../../../extensions/capture-models/MediaExplorer/MediaExplorer';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { serverRendererFor } from '../../../../shared/plugins/external/server-renderer-for';

export function ProjectBannerEditor() {
  const [isEditingBanner, setIsEditingBanner] = useState(false);
  const { data, refetch } = useData(ProjectBannerEditor);
  const [tempBanner, setTempBanner] = useState<string | null>(null);
  const api = useApi();
  const banner = data?.placeholderImage;
  const projectId = data?.id;

  const [changeBanner, changeBannerStatus] = useMutation(async (newBanner: string | null) => {
    if (projectId) {
      await api.updateProjectBanner(projectId, newBanner);
    }
    await refetch();
  });

  if (isEditingBanner) {
    return (
      <div>
        <MediaExplorer
          id={'banner'}
          label="Project banner"
          type="media-explorer"
          value={null}
          updateValue={value => {
            setTempBanner(value?.image || null);
            changeBanner(value?.image || null).then(() => {
              setTempBanner(null);
            });
            setIsEditingBanner(false);
          }}
        />
      </div>
    );
  }

  if (banner || tempBanner) {
    return (
      <div style={{ width: '100%', marginBottom: 30 }}>
        <h3>Banner image</h3>
        <img src={tempBanner || banner} alt="banner" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        <ButtonRow>
          <Button disabled={changeBannerStatus.isLoading} onClick={() => setIsEditingBanner(true)}>
            Change banner
          </Button>
          <Button disabled={changeBannerStatus.isLoading} onClick={() => changeBanner(null)}>
            Remove banner
          </Button>
        </ButtonRow>
      </div>
    );
  }

  return (
    <div>
      <h3>Banner image</h3>
      <Button onClick={() => setIsEditingBanner(true)}>Add banner</Button>
    </div>
  );
}

serverRendererFor(ProjectBannerEditor, {
  getKey(params) {
    return ['project-banner-data', { id: params.id }];
  },
  async getData(key, vars, api) {
    return api.getProject(vars.id);
  },
});
