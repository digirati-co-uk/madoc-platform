import { CaptureModel } from '@capture-models/types';
import React, { Suspense } from 'react';
import { CanvasFull } from '../../../../types/schemas/canvas-full';
import { parseUrn } from '../../../../utility/parse-urn';
import { ViewContentFetch } from '../../../admin/molecules/ViewContentFetch';
import { TinyButton } from '../../atoms/Button';
import { ContentExplorer } from '../../components/ContentExplorer';
import { ViewContent } from '../../components/ViewContent';
import { ViewExternalContent } from '../../components/ViewExternalContent';

export type EditorContentVariations = {
  // This is the aim to resolve.
  canvas?: CanvasFull;
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
}) => {
  if (explorer) {
    return (
      <ContentExplorer
        canvasId={canvasId}
        renderChoice={(cid, reset) => (
          <Suspense fallback={<>Loading</>}>
            <>
              <ViewContentFetch height={height} id={cid} />
              {explorerReset ? (
                <>
                  <br />
                  <TinyButton onClick={reset}>Select different image</TinyButton>
                </>
              ) : null}
            </>
          </Suspense>
        )}
      />
    );
  }

  if (canvasUri && manifestUri) {
    return (
      <ViewExternalContent
        target={[
          { type: 'Canvas', id: canvasUri },
          { type: 'Manifest', id: manifestUri },
        ]}
      />
    );
  }

  if (canvas && target) {
    return <ViewContent target={target as any} canvas={canvas} height={height} />;
  }

  if (canvasId) {
    return <ViewContentFetch id={Number(canvasId)} height={height} />;
  }

  if (target) {
    const canvasTarget = target.find(t => t.type.toLowerCase() === 'canvas');
    const canvasTargetUrn = canvasTarget ? parseUrn(canvasTarget.id) : undefined;
    if (canvasTargetUrn) {
      return <ViewContentFetch id={Number(canvasTargetUrn.id)} height={height} />;
    }
  }

  return <div>Nothing to render</div>;
};
