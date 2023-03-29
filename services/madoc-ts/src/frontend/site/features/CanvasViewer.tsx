import React from 'react';
import ReactTooltip from 'react-tooltip';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  LayoutSidebarMenu,
  NavIconContainer,
  NavIconNotifcation,
  OuterLayoutContainer,
  PanelTitle,
} from '../../shared/layout/LayoutContainer';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useResizeLayout } from '../../shared/hooks/use-resize-layout';
import { useAnnotationPanel } from '../hooks/canvas-menu/annotation-panel';
import { useDocumentPanel } from '../hooks/canvas-menu/document-panel';
import { useMetadataMenu } from '../hooks/canvas-menu/metadata-panel';
import { usePersonalNotesMenu } from '../hooks/canvas-menu/personal-notes';
import { useRevisionPanel } from '../hooks/canvas-menu/revision-panel';
import { useTranscriptionMenu } from '../hooks/canvas-menu/transcription-panel';
import { useTaggingPanel } from '../hooks/canvas-menu/tagging-panel';
import { CanvasMenuHook } from '../hooks/canvas-menu/types';
import { useViewerHeight } from '../hooks/use-viewer-height';
import { ButtonIcon } from '../../shared/navigation/Button';
import ResizeHandleIcon from '../../shared/icons/ResizeHandleIcon';

export interface CanvasViewerProps {
  border?: string;
  sidebarHeading?: boolean;
  tabsTop?: boolean;
  tabsName?: boolean;
  sidebarSpace?: boolean;
  verticalButtons?: boolean;
  btnColor?: string;

  // Enable pins. MUST BE KEYS ON THE COMPONENT.
  pins?: {
    disableMetadata?: boolean;
    disableAnnotationPanel?: boolean;
    disableTranscriptionMenu?: boolean;
    disableDocumentPanel?: boolean;
    disableRevisionPanel?: boolean;
    disablePersonalNotes?: boolean;
    disableTagPanel?: boolean;
  };

  children?: React.ReactNode;
}

export function CanvasViewer({
  pins = {},
  border,
  sidebarHeading,
  tabsTop,
  tabsName,
  sidebarSpace,
  verticalButtons,
  btnColor,
  children,
}: CanvasViewerProps) {
  const [openPanel, setOpenPanel] = useLocalStorage<string>(`canvas-page-selected`, 'metadata');
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const height = useViewerHeight();
  const {
    disableDocumentPanel,
    disablePersonalNotes,
    disableRevisionPanel,
    disableAnnotationPanel,
    disableTranscriptionMenu,
    disableMetadata,
    disableTagPanel,
  } = pins;

  // @todo this needs a re-think.
  const menuItems = [
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableMetadata ? null : useMetadataMenu(),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableAnnotationPanel ? null : useAnnotationPanel(openPanel === 'annotations' && isOpen),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableTranscriptionMenu ? null : useTranscriptionMenu(),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableDocumentPanel ? null : useDocumentPanel(),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableRevisionPanel ? null : useRevisionPanel(),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disablePersonalNotes ? null : usePersonalNotesMenu(),
    // eslint-disable-next-line react-hooks/rules-of-hooks
    disableTagPanel ? null : useTaggingPanel(),
  ].filter(Boolean) as CanvasMenuHook[];

  const currentMenuItem = menuItems.find(e => e.id === openPanel);
  const borderColor = border ? border : 'transparent';

  const { widthB, refs } = useResizeLayout(`canvas-page.${currentMenuItem ? currentMenuItem.id : ''}`, {
    left: true,
    widthB: '280px',
    maxWidthPx: 800,
    minWidthPx: 200,
    onDragEnd: () => {
      setIsOpen(true);
    },
  });

  const sidebar = (
    <LayoutSidebarMenu style={{ display: tabsTop ? 'flex' : '', borderRight: tabsTop ? 'none' : '1px solid #bcbcbc' }}>
      {menuItems.map(menuItem => {
        if (menuItem.isHidden) {
          return null;
        }
        return (
          <NavIconContainer
            data-has-label={tabsName}
            key={menuItem.id}
            $active={!menuItem.isDisabled && menuItem.id === openPanel && isOpen}
            data-tip={tabsName ? null : menuItem.label}
            $disabled={menuItem.isDisabled}
            onClick={() => {
              if (!menuItem.isDisabled) {
                if (isOpen && menuItem.id === openPanel) {
                  setIsOpen(false);
                } else {
                  setIsOpen(true);
                  setOpenPanel(menuItem.id as any);
                  if (refs.resizableDiv.current) {
                    refs.resizableDiv.current.scrollTop = 0;
                  }
                }
              }
            }}
          >
            {menuItem.notifications && !(isOpen && menuItem.id === openPanel) ? (
              <NavIconNotifcation>{menuItem.notifications}</NavIconNotifcation>
            ) : null}
            {menuItem.icon} {tabsName && menuItem.label}
          </NavIconContainer>
        );
      })}
    </LayoutSidebarMenu>
  );

  return (
    <>
      <div>
        {tabsTop && sidebar}
        {sidebarHeading && <PanelTitle>{openPanel}</PanelTitle>}
        <OuterLayoutContainer style={{ height }} data-flex-col={tabsTop}>
          {!tabsTop && sidebar}
          <LayoutContainer ref={refs.container as any}>
            {currentMenuItem && isOpen && !currentMenuItem.isDisabled && !currentMenuItem.isHidden ? (
              <LayoutSidebar
                ref={refs.resizableDiv as any}
                data-space={sidebarSpace}
                style={{ width: widthB, border: `1px solid ${borderColor}` }}
              >
                {currentMenuItem.content}
              </LayoutSidebar>
            ) : null}

            <LayoutHandle ref={refs.resizer as any} onClick={() => setIsOpen(o => !o)}>
              <ButtonIcon>
                <ResizeHandleIcon />
              </ButtonIcon>
            </LayoutHandle>
            <LayoutContent
              $btnColor={btnColor}
              style={{ border: `1px solid ${borderColor}` }}
              data-vertical-btn={verticalButtons}
            >
              {children}
            </LayoutContent>
          </LayoutContainer>
        </OuterLayoutContainer>
      </div>
      <ReactTooltip place="right" type="dark" effect="solid" />
    </>
  );
}
