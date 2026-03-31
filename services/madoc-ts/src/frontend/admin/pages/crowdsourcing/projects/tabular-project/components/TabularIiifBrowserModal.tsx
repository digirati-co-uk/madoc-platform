import React from 'react';
import type { TFunction } from 'i18next';
import type { IIIFBrowserProps } from 'iiif-browser';
import { ErrorMessage } from '../../../../../../shared/callouts/ErrorMessage';
import { BrowserComponent } from '../../../../../../shared/utility/browser-component';
import { IsolatedIIIFBrowser } from './IsolatedIIIFBrowser';
import { ChevronDown } from '@/frontend/shared/icons/ChevronIcon';

interface TabularIiifBrowserModalProps {
  t: TFunction;
  iiifHomeLoadError: string | null;
  browserVersion: number;
  navigationOptions: IIIFBrowserProps['navigation'];
  historyOptions: IIIFBrowserProps['history'];
  searchOptions?: IIIFBrowserProps['search'];
  outputOptions: IIIFBrowserProps['output'];
  uiOptions: IIIFBrowserProps['ui'];
}

export function TabularIiifBrowserModal(props: TabularIiifBrowserModalProps) {
  const [showCanvasHelp, setShowCanvasHelp] = React.useState(false);
  const {
    t,
    iiifHomeLoadError,
    browserVersion,
    navigationOptions,
    historyOptions,
    searchOptions,
    outputOptions,
    uiOptions,
  } = props;
  const iiifPickerMode = 'external';
  const canvasHelpPanelId = 'tabular-iiif-canvas-help';

  return (
    <div className="tabular-iiif-browser-modal min-h-[420px]">
      <style>
        {`
          .tabular-iiif-browser-external .grid-lg,
          .tabular-iiif-browser-external .grid-md,
          .tabular-iiif-browser-external .grid-sm {
            display: grid;
            gap: 12px;
          }

          .tabular-iiif-browser-external button,
          .tabular-iiif-browser-external [role="button"],
          .tabular-iiif-browser-external a {
            color: #1f2d5a;
          }

          .tabular-iiif-browser-external button:disabled,
          .tabular-iiif-browser-external [role="button"][aria-disabled="true"] {
            color: #64748b;
          }

          /* Keep the output action bar ("Use selected canvas") pinned like the top toolbar. */
          .tabular-iiif-browser-external .p-2.border-t.bg-gray-100.flex.gap-2.relative.justify-between.min-h-16.items-center.z-30 {
            position: sticky;
            bottom: 0;
            z-index: 35;
          }

          .tabular-iiif-browser-external .p-2.border-t.bg-gray-100.flex.gap-2.relative.justify-between.min-h-16.items-center.z-30 button {
            color: #ffffff;
          }

          .tabular-iiif-browser-external .p-2.border-t.bg-gray-100.flex.gap-2.relative.justify-between.min-h-16.items-center.z-30 button:disabled {
            color: #cbd5e1;
          }
        `}
      </style>
      <div className="mb-3 grid gap-1.5 rounded border border-[#ced8ff] bg-[#e8edff] p-3">
        <button
          type="button"
          aria-expanded={showCanvasHelp}
          aria-controls={canvasHelpPanelId}
          onClick={() => setShowCanvasHelp(currentState => !currentState)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <span className="text-xs font-semibold text-[#1f2d5a]">{t('How to find the right canvas')}</span>
          <span className="text-xs font-medium text-[#1f2d5a]">
            <ChevronDown
              aria-hidden="true"
              className={`h-4 w-4 transition-transform duration-200 ${showCanvasHelp ? 'rotate-180' : 'rotate-0'}`}
            />
          </span>
        </button>
        {showCanvasHelp ? (
          <div id={canvasHelpPanelId} className="grid gap-1.5">
            <div className="text-xs text-[#1f2d5a]/90">{t('1. Search by title or keyword in Madoc.')}</div>
            <div className="text-xs text-[#1f2d5a]/90">{t('2. Paste a IIIF URI to open external content.')}</div>
            <div className="text-xs text-[#1f2d5a]/90">
              {t('3. Open a collection or manifest, then select a canvas.')}
            </div>
            <div className="text-xs text-[#1f2d5a]/90">{t('4. Click "Use selected canvas".')}</div>
          </div>
        ) : null}
      </div>

      {iiifHomeLoadError ? <ErrorMessage>{iiifHomeLoadError}</ErrorMessage> : null}

      {iiifPickerMode === 'external' ? (
        <div className="tabular-iiif-browser-external relative">
          <BrowserComponent fallback={<div>{t('Loading IIIF browser...')}</div>}>
            <IsolatedIIIFBrowser
              key={`tabular-iiif-browser-${browserVersion}`}
              className="iiif-browser relative border-none border-t rounded-none h-[56vh] min-h-[420px] max-h-[56vh] max-w-full"
              navigation={navigationOptions}
              history={historyOptions}
              output={outputOptions}
              ui={uiOptions}
              search={searchOptions}
            />
          </BrowserComponent>
        </div>
      ) : null}
    </div>
  );
}
