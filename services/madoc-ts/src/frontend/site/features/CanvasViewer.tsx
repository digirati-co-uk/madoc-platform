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
import { useViewerHeight } from '../hooks/use-viewer-height';

export const CanvasViewer: React.FC = ({ children }) => {
  const [openPanel, setOpenPanel] = useLocalStorage<string>(`canvas-page-selected`, 'metadata');
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const height = useViewerHeight();
  const menuItems = [
    useMetadataMenu(),
    useAnnotationPanel(openPanel === 'annotations' && isOpen),
    useTranscriptionMenu(),
    useDocumentPanel(),
    useRevisionPanel(),
    usePersonalNotesMenu(),
  ];
  const currentMenuItem = menuItems.find(e => e.id === openPanel);

  const { widthB, refs } = useResizeLayout(`canvas-page.${currentMenuItem ? currentMenuItem.id : ''}`, {
    left: true,
    widthB: '280px',
    maxWidthPx: 800,
    minWidthPx: 200,
    onDragEnd: () => {
      setIsOpen(true);
    },
  });

  return (
    <>
      <PanelTitle>{openPanel}</PanelTitle>
      <OuterLayoutContainer style={{ height }}>
        <LayoutSidebarMenu>
          {menuItems.map(menuItem => {
            if (menuItem.isHidden) {
              return null;
            }
            return (
              <NavIconContainer
                key={menuItem.id}
                $active={!menuItem.isDisabled && menuItem.id === openPanel && isOpen}
                data-tip={menuItem.label}
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
                {menuItem.icon}
              </NavIconContainer>
            );
          })}
        </LayoutSidebarMenu>
        <LayoutContainer ref={refs.container as any}>
          {currentMenuItem && isOpen && !currentMenuItem.isDisabled && !currentMenuItem.isHidden ? (
            <LayoutSidebar ref={refs.resizableDiv as any} style={{ width: widthB }}>
              {currentMenuItem.content}
            </LayoutSidebar>
          ) : null}

          <LayoutHandle ref={refs.resizer as any} onClick={() => setIsOpen(o => !o)} />
          <LayoutContent>{children}</LayoutContent>
        </LayoutContainer>
      </OuterLayoutContainer>
      <ReactTooltip place="right" type="dark" effect="solid" />
    </>
  );
};
