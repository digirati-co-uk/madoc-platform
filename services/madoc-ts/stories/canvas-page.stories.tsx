import { CanvasContext, VaultProvider } from '@hyperion-framework/react-vault';
import { text } from '@storybook/addon-knobs';
import { useState } from 'react';
import * as React from 'react';
import {
  KanbanAssignee,
  KanbanBoard,
  KanbanBoardContainer,
  KanbanCard,
  KanbanCardButton,
  KanbanCardInner,
  KanbanCardTextButton,
  KanbanCol,
  KanbanColTitle,
  KanbanLabel,
  KanbanType,
} from '../src/frontend/shared/atoms/Kanban';
import {
  LayoutContainer,
  LayoutContent,
  LayoutHandle,
  LayoutSidebar,
  LayoutSidebarMenu,
  NavIconContainer,
  OuterLayoutContainer,
} from '../src/frontend/shared/atoms/LayoutContainer';
import {
  TaskItem,
  TaskItemAuthor,
  TaskItemDescription,
  TaskItemImageContainer,
  TaskItemMetadata,
  TaskItemTagContainer,
  TaskItemTagStatus,
  TaskItemTagType,
  TaskListContainer,
} from '../src/frontend/shared/atoms/TaskList';
import { URLContextExplorer } from '../src/frontend/shared/components/ContentExplorer';
import { MetaDataDisplay } from '../src/frontend/shared/components/MetaDataDisplay';
import { SimpleAtlasViewer } from '../src/frontend/shared/components/SimpleAtlasViewer';
import { useResizeLayout } from '../src/frontend/shared/hooks/use-resize-layout';
import ReactTooltip from 'react-tooltip';
import { AnnotationsIcon } from '../src/frontend/shared/icons/AnnotationsIcon';
import { InfoIcon } from '../src/frontend/shared/icons/InfoIcon';
import { ModelDocumentIcon } from '../src/frontend/shared/icons/ModelDocumentIcon';
import { TranscriptionIcon } from '../src/frontend/shared/icons/TranscriptionIcon';

export default { title: 'Canvas page' };

const exampleMetadata = [
  {
    label: {
      none: ['Identifier'],
    },
    value: {
      none: ['Digital Store 12603.h.15.'],
    },
  },
  {
    label: {
      none: ['Held by'],
    },
    value: {
      none: ['<span><a href="https://www.bl.uk">The British Library</a></span>'],
    },
  },
  {
    label: {
      none: ['Title'],
    },
    value: {
      none: [
        'The personal history of David Copperfield   / by Charles Dickens ; with sixty-one illustrations by F. Barnard',
      ],
    },
  },
  {
    label: {
      none: ['Creator'],
    },
    value: {
      none: ['Dickens, Charles'],
    },
  },
  {
    label: {
      none: ['Place'],
    },
    value: {
      none: ['London'],
    },
  },
  {
    label: {
      none: ['Publisher'],
    },
    value: {
      none: ['Chapman and Hall'],
    },
  },
  {
    label: {
      none: ['Date'],
    },
    value: {
      none: ['[1872]'],
    },
  },
  {
    label: {
      none: ['Language'],
    },
    value: {
      none: ['English'],
    },
  },
  {
    label: {
      none: ['Catalogue record'],
    },
    value: {
      none: [
        '<a href="http://explore.bl.uk/primo_library/libweb/action/dlDisplay.do?docId=BLL01014809080&amp;vid=BLVU1&amp;lang=en_US&amp;institution=BL">View the catalogue record</a>',
      ],
    },
  },
  {
    label: {
      none: ['Digitised from'],
    },
    value: {
      none: [
        '<a href="http://explore.bl.uk/primo_library/libweb/action/dlDisplay.do?docId=BLL01000930626&amp;vid=BLVU1&amp;lang=en_US&amp;institution=BL">The personal history of David Copperfield</a>',
      ],
    },
  },
  {
    label: {
      none: ['Citation'],
    },
    value: {
      none: [
        '<span>Dickens, Charles, <i>The personal history of David Copperfield   / by Charles Dickens ; with sixty-one illustrations by F. Barnard</i>, (London: Chapman and Hall, [1872]) &lt;http://access.bl.uk/item/viewer/ark:/81055/vdc_00000004216E&gt;</span>',
      ],
    },
  },
  {
    label: {
      none: ['Digitised by'],
    },
    value: {
      none: ['The British Library'],
    },
  },
  {
    label: {
      none: ['A much longer label that will be trimmed'],
    },
    value: {
      none: ['The British Library'],
    },
  },
];

export const Main_Page = () => {
  const [isOpen, setIsOpen] = useState(true);
  const { widthB, widthA, refs } = useResizeLayout('storybook-canvas-page6', {
    left: true,
    widthB: '280px',
    maxWidthPx: 350,
    minWidthPx: 200,
    onDragEnd: () => {
      setIsOpen(true);
    },
  });

  const defaultManifest = text('Manifest', 'https://wellcomelibrary.org/iiif/b18035723/manifest');

  const type = React.useMemo(() => {
    return { type: 'Manifest', id: defaultManifest };
  }, [defaultManifest]);

  return (
    <VaultProvider>
      <div style={{ padding: '1em' }}>
        <OuterLayoutContainer style={{ height: 600 }}>
          <LayoutSidebarMenu>
            <NavIconContainer $active data-tip="Metadata">
              <InfoIcon />
            </NavIconContainer>
            <NavIconContainer data-tip="Annotations">
              <AnnotationsIcon />
            </NavIconContainer>
            <NavIconContainer data-tip="Transcription">
              <TranscriptionIcon />
            </NavIconContainer>
            <NavIconContainer data-tip="Document">
              <ModelDocumentIcon />
            </NavIconContainer>
          </LayoutSidebarMenu>
          <LayoutContainer ref={refs.container}>
            {isOpen && (
              <LayoutSidebar ref={refs.resizableDiv} style={{ width: widthB }}>
                <MetaDataDisplay metadata={exampleMetadata} variation={'list'} labelStyle={'bold'} bordered={true} />
              </LayoutSidebar>
            )}
            <LayoutHandle ref={refs.resizer} onClick={() => setIsOpen(o => !o)} />
            <LayoutContent>
              <URLContextExplorer
                defaultResource={type}
                renderChoice={canvasId => (
                  <React.Suspense fallback={<>Loading</>}>
                    <CanvasContext canvas={canvasId}>
                      <SimpleAtlasViewer
                        style={{ height: '100%', minWidth: 0, width: '100%', overflow: 'hidden', minHeight: 0 }}
                      />
                    </CanvasContext>
                  </React.Suspense>
                )}
              />
            </LayoutContent>
          </LayoutContainer>
        </OuterLayoutContainer>
        <ReactTooltip place="right" type="dark" effect="solid" />
      </div>
    </VaultProvider>
  );
};

export const Task_Layout: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(4);
  const [isOpen, setIsOpen] = useState(true);
  const { widthB, widthA, refs } = useResizeLayout('storybook-canvas-page6', {
    left: true,
    widthB: '280px',
    maxWidthPx: 450,
    minWidthPx: 240,
    onDragEnd: () => {
      setIsOpen(true);
    },
  });
  return (
    <div style={{ padding: '1em', height: '100vh' }}>
      <OuterLayoutContainer>
        <LayoutContainer ref={refs.container}>
          {isOpen && (
            <LayoutSidebar ref={refs.resizableDiv} style={{ width: widthB }}>
              <TaskListContainer>
                {new Array(50).fill(0).map((_, n) => {
                  return (
                    <TaskItem key={n} $selected={n === selectedIdx} onClick={() => setSelectedIdx(n)}>
                      <TaskItemImageContainer>
                        <img
                          src={
                            n % 2
                              ? 'https://view.nls.uk/iiif/7443/74438564.5/full/256,/0/default.jpg'
                              : 'https://view.nls.uk/iiif/7443/74438562.5/full/256,/0/default.jpg'
                          }
                          alt="any"
                        />
                      </TaskItemImageContainer>
                      <TaskItemMetadata>
                        <TaskItemAuthor>Stephen</TaskItemAuthor>
                        <TaskItemDescription>
                          Scottish bridges with very long description thing that will{' '}
                        </TaskItemDescription>
                        <TaskItemTagContainer>
                          <TaskItemTagType>Review</TaskItemTagType>
                          <TaskItemTagStatus>In progress</TaskItemTagStatus>
                        </TaskItemTagContainer>
                      </TaskItemMetadata>
                    </TaskItem>
                  );
                })}
              </TaskListContainer>
            </LayoutSidebar>
          )}
          <LayoutHandle ref={refs.resizer} onClick={() => setIsOpen(o => !o)} />
          <LayoutContent $padding>
            <KanbanBoard>
              <KanbanBoardContainer>
                <KanbanCol>
                  <KanbanColTitle>Waiting for contributor</KanbanColTitle>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                </KanbanCol>
                <KanbanCol>
                  <KanbanColTitle>Waiting for contributor</KanbanColTitle>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                    <KanbanCardButton>view contribution</KanbanCardButton>
                  </KanbanCard>
                  <KanbanCard>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                    <KanbanCardTextButton>view contribution</KanbanCardTextButton>
                  </KanbanCard>
                </KanbanCol>
                <KanbanCol>
                  <KanbanColTitle>Completed reviews</KanbanColTitle>
                  <KanbanCard $disabled>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                  <KanbanCard $disabled>
                    <KanbanCardInner>
                      <KanbanLabel>{`Contributions to "Some manifest"`}</KanbanLabel>
                      <KanbanType>Crowdsourcing task</KanbanType>
                    </KanbanCardInner>
                    <KanbanAssignee>
                      {Math.random()
                        .toString(36)
                        .substr(2, 15)}
                    </KanbanAssignee>
                  </KanbanCard>
                </KanbanCol>
              </KanbanBoardContainer>
            </KanbanBoard>
          </LayoutContent>
        </LayoutContainer>
      </OuterLayoutContainer>
    </div>
  );
};
