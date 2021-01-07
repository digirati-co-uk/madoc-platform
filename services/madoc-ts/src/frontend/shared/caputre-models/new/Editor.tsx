import { Revisions } from '@capture-models/editor';
import { CaptureModel, RevisionRequest } from '@capture-models/types';
import React, { useState } from 'react';
import { CanvasFull } from '../../../../types/schemas/canvas-full';
import { ViewContent } from '../../components/ViewContent';
import { useApi } from '../../hooks/use-api';
import { RevisionEditor } from '../../viewers/revision-editor';
import { CaptureModelEditor } from '../CaptureModelEditor';
import { EditorContentViewer } from './EditorContent';

export type EditorProps = {
  // Capture model itself
  captureModel: CaptureModel;
  revisionId?: string; // This should be inside of the capture model.. right?
  revisionList?: string[]; // List of revisions to show navigation for.

  // Content resolution
  content?:
    | {
        // This is the aim to resolve.
        canvas: CanvasFull;
        transcription?: string;
      }
    | {
        // Can be resolved from this.
        target: CaptureModel['target'];
      }
    | {
        // Can also be resolved from this.
        canvasId: number;
      }
    | {
        canvasId?: number;
        explorer: boolean;
      }
    | {
        canvasUri: string;
        manifestUri: string;
      };

  // Toolbar customisations
  toolbar?: {
    onBackButton?: () => void;
    enableMaximise?: boolean;
    enableOrientation?: boolean;
  };

  // Saving / editing restrictions
  readOnly?: boolean;
  allowEditingModel?: boolean;
  allowEditingRevision?: boolean;
  allowNavigation?: boolean;
  onSaveRevision?: (revision: RevisionRequest) => void | Promise<void>;
  onSaveCaptureModel?: (revision: CaptureModel) => void | Promise<void>;
};

export const Editor: React.FC<EditorProps> = ({
  revisionId,
  readOnly,
  allowEditingRevision,
  captureModel,
  allowNavigation,
  content,
}) => {
  const api = useApi();
  const [isVertical, setIsVertical] = useState(false);
  const contentToUse = content ? content : captureModel.target ? { target: captureModel.target } : {};

  const onSave = () => {
    // No-op;
  };

  if (api.getIsServer()) {
    return null;
  }

  return (
    <React.Suspense fallback={<div>loading...</div>}>
      <Revisions.Provider captureModel={captureModel} revision={revisionId}>
        <h2>Editor</h2>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
          <div style={{ width: isVertical ? '100%' : '67%' }}>
            <EditorContentViewer {...contentToUse} />
          </div>
          <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
            {revisionId ? (
              <RevisionEditor allowEdits={!!allowEditingRevision} readOnly={!!readOnly} onSave={onSave} />
            ) : (
              <CaptureModelEditor
                allowEdits={true}
                readOnly={false}
                captureModel={captureModel}
                onSave={onSave}
                allUsers={true}
              />
            )}
          </div>
        </div>
      </Revisions.Provider>
    </React.Suspense>
  );
};
