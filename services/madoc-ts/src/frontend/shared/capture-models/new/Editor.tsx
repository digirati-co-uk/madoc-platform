import React, { useMemo, useState } from 'react';
import { CanvasFull } from '../../../../types/canvas-full';
import { useSiteConfiguration } from '../../../site/features/SiteConfigurationContext';
import { useApi } from '../../hooks/use-api';
import { BrowserComponent } from '../../utility/browser-component';
import { CaptureModel } from '../types/capture-model';
import { RevisionRequest } from '../types/revision-request';
import { RevisionProviderWithFeatures } from './components/RevisionProviderWithFeatures';
import { EditorContentViewer } from './EditorContent';
import { RightPanel } from './RightPanel';

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
  const config = useSiteConfiguration();
  const [isVertical, setIsVertical] = useState(config.project.defaultEditorOrientation === 'vertical');
  const contentToUse = content ? content : captureModel.target ? { target: captureModel.target } : {};

  const slotConfig = useMemo(() => ({ allowEditing: allowEditingRevision }), [allowEditingRevision]);

  const onSave = () => {
    // No-op;
  };

  if (api.getIsServer()) {
    return null;
  }

  return (
    <BrowserComponent fallback={<div>loading...</div>}>
      <RevisionProviderWithFeatures
        captureModel={captureModel}
        revision={revisionId}
        slotConfig={{ editor: slotConfig }}
      >
        <h2>Editor</h2>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'column' : 'row' }}>
          <div style={{ width: isVertical ? '100%' : '67%' }}>
            <EditorContentViewer {...contentToUse} />
          </div>
          <div style={{ width: isVertical ? '100%' : '33%', padding: '1em' }}>
            <RightPanel />
          </div>
        </div>
      </RevisionProviderWithFeatures>
    </BrowserComponent>
  );
};
