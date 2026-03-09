import React from 'react';
import type { TFunction } from 'i18next';
import type { IIIFBrowserProps } from 'iiif-browser';
import { ErrorMessage } from '../../../../../../shared/callouts/ErrorMessage';
import { Input } from '../../../../../../shared/form/Input';
import { Button, TinyButton } from '../../../../../../shared/navigation/Button';
import { BrowserComponent } from '../../../../../../shared/utility/browser-component';
import type { IiifHomeStats } from '../types';
import { IsolatedIIIFBrowser } from './IsolatedIIIFBrowser';

interface TabularIiifBrowserModalProps {
  t: TFunction;
  iiifMadocSearchInput: string;
  onIiifMadocSearchInputChange: (value: string) => void;
  isLoadingIiifHome: boolean;
  onSearchMadocResources: () => void;
  onClearMadocSearch: () => void;
  iiifHomeStats: IiifHomeStats;
  iiifHomeLoadError: string | null;
  iiifBrowserModalError: string | null;
  browserVersion: number;
  navigationOptions: IIIFBrowserProps['navigation'];
  historyOptions: IIIFBrowserProps['history'];
  searchOptions?: IIIFBrowserProps['search'];
  outputOptions: IIIFBrowserProps['output'];
  uiOptions: IIIFBrowserProps['ui'];
}

export function TabularIiifBrowserModal(props: TabularIiifBrowserModalProps) {
  const {
    t,
    iiifMadocSearchInput,
    onIiifMadocSearchInputChange,
    isLoadingIiifHome,
    onSearchMadocResources,
    onClearMadocSearch,
    iiifHomeStats,
    iiifHomeLoadError,
    iiifBrowserModalError,
    browserVersion,
    navigationOptions,
    historyOptions,
    searchOptions,
    outputOptions,
    uiOptions,
  } = props;
  const iiifPickerMode = 'external';

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
        `}
      </style>
      <div className="mb-3 grid gap-1.5 rounded border border-[#d7dbe8] bg-[#eef3ff] p-2.5">
        <div className="text-xs font-semibold text-[#1f2d5a]">{t('How to find the right canvas')}</div>
        <div className="text-xs text-[#1f2d5a]/90">
          {t('1. Search Madoc resources by title using the search bar below.')}
        </div>
        <div className="text-xs text-[#1f2d5a]/90">
          {t('2. In the browser, double-click collections or manifests to navigate.')}
        </div>
        <div className="text-xs text-[#1f2d5a]/90">
          {t('3. Click a canvas, then use “Use selected canvas” to confirm your choice.')}
        </div>
      </div>
      <div className="mb-3 grid gap-2.5 rounded border border-[#d7dbe8] bg-[#f8fafc] p-2.5">
        <div className="grid gap-2">
          <div className="text-xs font-semibold">{t('Search Madoc manifests and collections')}</div>
          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Input
              type="text"
              value={iiifMadocSearchInput}
              onChange={event => onIiifMadocSearchInputChange(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  onSearchMadocResources();
                }
              }}
              placeholder={t('Search by collection or manifest title')}
            />
            <Button type="button" onClick={onSearchMadocResources} disabled={isLoadingIiifHome}>
              {isLoadingIiifHome ? t('Loading...') : t('Search')}
            </Button>
            <TinyButton type="button" onClick={onClearMadocSearch} disabled={isLoadingIiifHome}>
              {t('Clear')}
            </TinyButton>
          </div>
          <div className="text-xs opacity-80">{t('Tip: clear search to return to the default Madoc browse view.')}</div>
          <div className="text-xs opacity-80">
            {isLoadingIiifHome
              ? t('Loading Madoc resources...')
              : t('Showing {{collections}} collections and {{manifests}} manifests', {
                  collections: iiifHomeStats.collections,
                  manifests: iiifHomeStats.manifests,
                })}
          </div>
        </div>
      </div>

      {iiifHomeLoadError ? <ErrorMessage>{iiifHomeLoadError}</ErrorMessage> : null}
      {iiifBrowserModalError ? <ErrorMessage>{iiifBrowserModalError}</ErrorMessage> : null}

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
