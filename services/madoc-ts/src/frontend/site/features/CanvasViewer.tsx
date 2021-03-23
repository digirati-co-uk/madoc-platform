import React from 'react';
import ReactTooltip from 'react-tooltip';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  LayoutSidebarMenu,
  NavIconContainer,
  OuterLayoutContainer,
} from '../../shared/atoms/LayoutContainer';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useResizeLayout } from '../../shared/hooks/use-resize-layout';
import { useAnnotationPanel } from '../hooks/canvas-menu/annotation-panel';
import { useDocumentPanel } from '../hooks/canvas-menu/document-panel';
import { useMetadataMenu } from '../hooks/canvas-menu/metadata-panel';
import { useTranscriptionMenu } from '../hooks/canvas-menu/transcription-panel';

export const CanvasViewer: React.FC = ({ children }) => {
  const [openPanel, setOpenPanel] = useLocalStorage<string>(`canvas-page-selected`, 'metadata');
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const menuItems = [
    useMetadataMenu(),
    useAnnotationPanel(openPanel === 'annotations' && isOpen),
    useTranscriptionMenu(),
    useDocumentPanel(),
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
      <OuterLayoutContainer style={{ height: '60vh' }}>
        <LayoutSidebarMenu>
          {menuItems.map(menuItem => {
            return (
              <NavIconContainer
                key={menuItem.id}
                $active={menuItem.id === openPanel && isOpen}
                data-tip={menuItem.label}
                onClick={() => {
                  if (isOpen && menuItem.id === openPanel) {
                    setIsOpen(false);
                  } else {
                    setIsOpen(true);
                    setOpenPanel(menuItem.id as any);
                    if (refs.resizableDiv.current) {
                      refs.resizableDiv.current.scrollTop = 0;
                    }
                  }
                }}
              >
                {menuItem.icon}
              </NavIconContainer>
            );
          })}
        </LayoutSidebarMenu>
        <LayoutContainer ref={refs.container as any}>
          {currentMenuItem && isOpen ? (
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
