import React from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasContext, ManifestContext, useExternalManifest } from 'react-iiif-vault';
import { ViewContentFetch } from '../../../admin/molecules/ViewContentFetch';
import { CanvasVaultContext } from '../CanvasVaultContext';
import { ContentExplorer } from '../../features/ContentExplorer';
import { TinyButton } from '../../navigation/Button';
import { BrowserComponent } from '../../utility/browser-component';
import { EditorContentVariations } from './EditorContent';

export const DynamicVaultContext = React.memo(function DynamicVaultContext({
  children,
  onCreated,
  onPanInSketchMode,
  height,
  canvasId,
  canvas,
  canvasUri,
  manifestUri,
  target,
  explorerReset,
  explorer,
}: EditorContentVariations & { children: React.ReactNode }) {
  const { t } = useTranslation();

  if (explorer) {
    return (
      <ContentExplorer
        canvasId={canvasId}
        renderChoice={(cid, reset) => (
          <BrowserComponent fallback={<>Loading</>}>
            <>
              <ViewContentFetch height={height} id={cid} onCreated={onCreated} onPanInSketchMode={onPanInSketchMode} />
              {explorerReset ? (
                <>
                  <br />
                  <TinyButton onClick={reset}>{t('Select different image')}</TinyButton>
                </>
              ) : null}
            </>
          </BrowserComponent>
        )}
      />
    );
  }

  if (canvas && target) {
    return <>{children}</>;
  }

  if (canvasUri && manifestUri) {
    return (
      <ExternalManifestCtx manifest={manifestUri} canvas={canvasUri}>
        {children}
      </ExternalManifestCtx>
    );
  }

  if (canvasId) {
    return <CanvasVaultContext>{children}</CanvasVaultContext>;
  }

  if (target) {
    return <CanvasVaultContext>{children}</CanvasVaultContext>;
  }

  return null;
});

const ExternalManifestCtx = React.memo(function ExternalManifestCtx({
  manifest,
  canvas,
  children,
}: {
  manifest: string;
  canvas: string;
  children: React.ReactNode;
}) {
  const { isLoaded } = useExternalManifest(manifest);

  if (!isLoaded) {
    return null;
  }

  return (
    <ManifestContext manifest={manifest}>
      <CanvasContext canvas={canvas}>{children}</CanvasContext>
    </ManifestContext>
  );
});
