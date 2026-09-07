import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCreateLocaleString } from '../../../../shared/components/LocaleString';
import { StandaloneCanvasViewer } from '../../../../shared/components/StandaloneCanvasViewer';
import { useManifestStructure } from '../../../../shared/hooks/use-manifest-structure';
import { CustomRouteContext } from '../../../../shared/page-blocks/slot-context';

const buttonClassName =
  'min-w-0 rounded border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50';

export function ManifestReviewViewer({ manifestId }: { manifestId: number }) {
  const { t } = useTranslation();
  const createLocaleString = useCreateLocaleString();
  const { data, isLoading, isError } = useManifestStructure(manifestId);
  const [selectedCanvasId, setSelectedCanvasId] = useState<number>();
  const items = data?.items || [];
  const index = Math.max(
    0,
    items.findIndex(item => item.id === selectedCanvasId)
  );
  const canvas = items[index];

  if (!canvas) {
    return <p role="status">{t(isLoading ? 'Loading...' : isError ? 'Unable to load canvases' : 'No canvases')}</p>;
  }

  return (
    <CustomRouteContext ctx={{ manifest: manifestId, canvas: canvas.id }}>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
        <nav aria-label={t('Manifest canvases')} className="grid grid-cols-2 gap-2 rounded bg-[#e6ecfe] p-2">
          <select
            aria-label={t('Canvas')}
            className="col-span-2 w-full min-w-0 rounded border border-gray-300 bg-white p-2 text-sm"
            value={canvas.id}
            onChange={event => setSelectedCanvasId(Number(event.target.value))}
          >
            {items.map((item, itemIndex) => (
              <option key={item.id} value={item.id}>
                {itemIndex + 1}. {createLocaleString(item.label, t('Canvas'))}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={buttonClassName}
            disabled={index === 0}
            onClick={() => setSelectedCanvasId(items[index - 1].id)}
          >
            {t('Previous canvas')}
          </button>
          <button
            type="button"
            className={buttonClassName}
            disabled={index === items.length - 1}
            onClick={() => setSelectedCanvasId(items[index + 1].id)}
          >
            {t('Next canvas')}
          </button>
          <span className="col-span-2 text-center text-sm">
            {t('Page {{page}} of {{count}}', { page: index + 1, count: items.length })}
          </span>
        </nav>
        <div className="flex min-h-0 flex-1 [&>div]:!h-full">
          <StandaloneCanvasViewer key={canvas.id} canvasId={canvas.id} />
        </div>
      </div>
    </CustomRouteContext>
  );
}
