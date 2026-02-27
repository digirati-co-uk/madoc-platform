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
    <div className="tabular-iiif-browser-modal" style={{ minHeight: 420 }}>
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
      <div
        style={{
          display: 'grid',
          gap: 10,
          marginBottom: 12,
          padding: 10,
          border: '1px solid #d7dbe8',
          borderRadius: 4,
          background: '#f8fafc',
        }}
      >
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 600 }}>{t('Search Madoc manifests and collections')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
            <Input
              type="text"
              value={iiifMadocSearchInput}
              onChange={event => onIiifMadocSearchInputChange(event.currentTarget.value)}
              placeholder={t('Search by title')}
            />
            <Button type="button" onClick={onSearchMadocResources} disabled={isLoadingIiifHome}>
              {isLoadingIiifHome ? t('Loading...') : t('Search')}
            </Button>
            <TinyButton type="button" onClick={onClearMadocSearch} disabled={isLoadingIiifHome}>
              {t('Clear')}
            </TinyButton>
          </div>
          <div style={{ fontSize: 12, opacity: 0.8 }}>
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
