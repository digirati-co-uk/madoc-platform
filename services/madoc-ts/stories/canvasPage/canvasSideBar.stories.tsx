import * as React from 'react';
import {
  LayoutSidebarMenu,
  NavIconContainer,
  NavIconNotifcation,
} from '../../src/frontend/shared/layout/LayoutContainer';
import { useMetadataMenu } from '../../src/frontend/site/hooks/canvas-menu/metadata-panel';
import { useAnnotationPanel } from '../../src/frontend/site/hooks/canvas-menu/annotation-panel';
import { useTranscriptionMenu } from '../../src/frontend/site/hooks/canvas-menu/transcription-panel';
import { useDocumentPanel } from '../../src/frontend/site/hooks/canvas-menu/document-panel';
import { useRevisionPanel } from '../../src/frontend/site/hooks/canvas-menu/revision-panel';
import { usePersonalNotesMenu } from '../../src/frontend/site/hooks/canvas-menu/personal-notes';
import { CanvasMenuHook } from '../../src/frontend/site/hooks/canvas-menu/types';
import { useLocalStorage } from '../../src/frontend/shared/hooks/use-local-storage';
import { AnnotationPanel } from './annotationPanel';
import { ViewDocument } from '../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { DynamicVaultContext } from '../../src/frontend/shared/capture-models/new/DynamicVaultContext';
import { useState } from 'react';
import { CaptureModel } from '../../src/frontend/shared/capture-models/types/capture-model';
import { modelWithStructure } from '../capture-models/interactions/CaptureModelTestHarness';
import { DocumentPanel } from './documentPanel';
export default {
  title: 'Components / Canvas sidebar',
};

const Template: any = (props: any) => {
  const [captureModel, setCaptureModel] = useState<CaptureModel>(() => modelWithStructure(props.captureModel));
  const [openPanel, setOpenPanel] = useLocalStorage<string>(`canvas-page-selected`, 'metadata');
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const target = props.target || {
    manifestUri: 'https://digirati-co-uk.github.io/wunder.json',
    canvasUri: 'https://digirati-co-uk.github.io/wunder/canvases/0',
  };

  const menuItems = [DocumentPanel()].filter(Boolean) as CanvasMenuHook[];

  return (
    <>
      <LayoutSidebarMenu>
        {menuItems.map(menuItem => {
          return (
            <NavIconContainer
              key={1}
              onClick={() => {
                console.log('k');
              }}
            >
              {menuItem.notifications && !(isOpen && menuItem.id === openPanel) ? (
                <NavIconNotifcation>{menuItem.notifications}</NavIconNotifcation>
              ) : null}
              {menuItem.icon} {menuItem.label}
            </NavIconContainer>
          );
        })}
      </LayoutSidebarMenu>
      );
    </>
  );
};

export const DefaultCanvasSideBar = Template.bind({});
