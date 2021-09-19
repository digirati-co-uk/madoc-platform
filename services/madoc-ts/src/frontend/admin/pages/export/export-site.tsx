import React, { useRef } from 'react';
import { useMutation } from 'react-query';
import { Button } from '../../../shared/navigation/Button';
import { WidePage } from '../../../shared/layout/WidePage';
import { useApi } from '../../../shared/hooks/use-api';
import { AdminHeader } from '../../molecules/AdminHeader';

export const ExportSite: React.FC = () => {
  const api = useApi();
  const downloadLink = useRef<string>();

  const [downloadSite, { isLoading: isDownloading, isSuccess }] = useMutation(async () => {
    const exportedJson = await api.request(`/api/madoc/site/1/export`, {
      method: 'POST',
    });

    const blob = new Blob([JSON.stringify(exportedJson)], { type: 'application/json' });
    downloadLink.current = window.URL.createObjectURL(blob);
    // a.download = 'export.json';
    // document.body.appendChild(a); // we need to append the element to the dom -> otherwise it will not work in firefox
    // a.click();
    // a.remove(); //afterwards we remove the element again
  });

  return (
    <>
      <AdminHeader
        breadcrumbs={[
          { label: 'Site admin', link: '/' },
          { label: 'Export site', link: `/enrichment/export/site`, active: true },
        ]}
        title="Export site contents"
      />
      <WidePage>
        <p>Download all of the site contributions.</p>
        {isSuccess ? null : (
          <Button onClick={() => downloadSite()}>{isDownloading ? 'Please wait...' : 'Download'}</Button>
        )}
        {isSuccess ? (
          <a download="export.json" href={downloadLink.current}>
            Click to start download
          </a>
        ) : null}
      </WidePage>
    </>
  );
};
