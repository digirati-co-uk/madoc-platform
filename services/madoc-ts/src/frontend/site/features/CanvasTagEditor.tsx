import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { useUser } from '../../shared/hooks/use-site';
import { useCanvasNavigation } from '../hooks/use-canvas-navigation';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { useViewerHeight } from '../hooks/use-viewer-height';
import { useResizeLayout } from '../../shared/hooks/use-resize-layout';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  OuterLayoutContainer,
  PanelTitle,
} from '../../shared/layout/LayoutContainer';
import { ButtonIcon } from '../../shared/navigation/Button';
import ResizeHandleIcon from '../../shared/icons/ResizeHandleIcon';
import ReactTooltip from 'react-tooltip';
import { CanvasImageViewer } from './CanvasImageViewer';
import { TaggingFormPannel } from './TaggingFormPannel';


export const CanvasTagEditor: React.FC<{
  rendering?: 'webgl' | 'canvas';
  tabsTop?: boolean;
  borderColor?: string;
  sidebarSpace?: boolean;
  verticalButtons?: boolean;
  buttonBackground?: string;
}> = ({
  rendering = 'canvas',
  tabsTop,
  borderColor,
  sidebarSpace,
  verticalButtons,
  buttonBackground,
}) => {
  const { showCanvasNavigation } = useCanvasNavigation();
  const user = useUser();
  const [isOpen, setIsOpen] = useLocalStorage<boolean>(`canvas-page-sidebar`, false);
  const height = useViewerHeight();

  const { widthB, refs } = useResizeLayout(`canvas-page.tags`, {
    left: true,
    widthB: '280px',
    maxWidthPx: 800,
    minWidthPx: 200,
    onDragEnd: () => {
      setIsOpen(true);
    },
  });

  if (!showCanvasNavigation || !user) {
    return null;
  }

  return (
    <>
      <div>
        <PanelTitle>Tags</PanelTitle>
        <OuterLayoutContainer style={{ height }} data-flex-col={tabsTop}>
          <LayoutContainer ref={refs.container as any}>
            {isOpen && (
              <LayoutSidebar
                ref={refs.resizableDiv as any}
                data-space={sidebarSpace}
                style={{ width: widthB, border: `1px solid ${borderColor}` }}
              >
                <TaggingFormPannel />
              </LayoutSidebar>
            )}
            <LayoutHandle ref={refs.resizer as any} onClick={() => setIsOpen(o => !o)}>
              <ButtonIcon>
                <ResizeHandleIcon />
              </ButtonIcon>
            </LayoutHandle>
            <LayoutContent
              $btnColor={buttonBackground}
              style={{ border: `1px solid ${borderColor}` }}
              data-vertical-btn={verticalButtons}
            >
              <CanvasImageViewer rendering={rendering} />
            </LayoutContent>
          </LayoutContainer>
        </OuterLayoutContainer>
      </div>
      <ReactTooltip place="right" type="dark" effect="solid" />
    </>
  );
};

blockEditorFor(CanvasTagEditor, {
  type: 'default.CanvasTagEditor',
  label: 'Canvas tag editor',
  requiredContext: ['topic', 'manifest', 'canvas'],
  anyContext: ['canvas'],
  editor: {
    rendering: {
      label: 'Rendering',
      description: 'Which rendering engine should be used for this viewer',
      type: 'dropdown-field',
      options: [
        { value: 'webgl', text: 'WebGL' },
        { value: 'canvas', text: 'Canvas' },
      ],
    },
    tabsTop: {
      label: 'Tabs position',
      type: 'checkbox-field',
      inlineLabel: 'display tabs on top',
    },
    borderColor: { label: 'Border color', type: 'color-field' },
    sidebarSpace: {
      label: 'Sidebar spacing',
      type: 'checkbox-field',
      inlineLabel: 'Add margin between sidebar and cavnvas',
    },
    verticalButtons: {
      label: 'Vertical canvas buttons',
      type: 'checkbox-field',
      inlineLabel: 'Display the canvas controls vertically (stacked)',
    },
    buttonBackground: { label: 'button background color', type: 'color-field' },
  },
  defaultProps: {
    rendering: 'webgl',
    tabsTop: false,
    borderColor: '',
    sidebarSpace: false,
    verticalButtons: false,
    buttonBackground: '',
  },
});
