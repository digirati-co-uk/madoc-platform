import { Preset } from '@atlas-viewer/atlas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CanvasFull } from '../../../../types/canvas-full';
import { parseUrn } from '../../../../utility/parse-urn';
import { ViewContentFetch } from '../../../admin/molecules/ViewContentFetch';
import { TinyButton } from '../../navigation/Button';
import { ContentExplorer } from '../../features/ContentExplorer';
import { ViewContent } from '../../components/ViewContent';
import { ViewExternalContent } from './ViewExternalContent';
import { BrowserComponent } from '../../utility/browser-component';
import { CaptureModel } from '../types/capture-model';

export type EditorContentVariations = {
  // This is the aim to resolve.
  canvas?: CanvasFull['canvas'];
  transcription?: string;
  // Can be resolved from this.
  target?: CaptureModel['target'];
  // Can also be resolved from this.
  canvasId?: number;
  explorer?: boolean;
  explorerReset?: boolean;
  canvasUri?: string;
  manifestUri?: string;
  height?: number;
  onCreated?: (preset: Preset) => void;
  onPanInSketchMode?: () => void;
  children?: React.ReactNode;
};

export const EditorContentViewer: React.FC<EditorContentVariations> = ({
  transcription,
  canvasId,
  canvas,
  canvasUri,
  explorer = false,
  explorerReset = true,
  manifestUri,
  target,
  height,
  children,
  onCreated,
  onPanInSketchMode,
}) => {
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
    return (
      <ViewContent
        target={target as any}
        canvas={canvas}
        height={height}
        onCreated={onCreated}
        onPanInSketchMode={onPanInSketchMode}
      >
        {children}
      </ViewContent>
    );
  }

  if (canvasUri && manifestUri) {
    return (
      <ViewExternalContent
        onCreated={onCreated}
        height={height}
        onPanInSketchMode={onPanInSketchMode}
        target={[
          { type: 'Canvas', id: canvasUri },
          { type: 'Manifest', id: manifestUri },
        ]}
      >
        {children}
      </ViewExternalContent>
    );
  }

  if (canvasId) {
    return (
      <BrowserComponent fallback={<>{t('loading')}</>}>
        <ViewContentFetch
          id={Number(canvasId)}
          height={height}
          onCreated={onCreated}
          onPanInSketchMode={onPanInSketchMode}
        >
          {children}
        </ViewContentFetch>
      </BrowserComponent>
    );
  }

  if (target) {
    const canvasTarget = target.find(r => r.type.toLowerCase() === 'canvas');
    const canvasTargetUrn = canvasTarget ? parseUrn(canvasTarget.id) : undefined;
    if (canvasTargetUrn) {
      return (
        <ViewContentFetch
          id={Number(canvasTargetUrn.id)}
          height={height}
          onCreated={onCreated}
          onPanInSketchMode={onPanInSketchMode}
        >
          {children}
        </ViewContentFetch>
      );
    }
  }

  return null;
};
