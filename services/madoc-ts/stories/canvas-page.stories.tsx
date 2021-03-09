import { CanvasContext, VaultProvider } from '@hyperion-framework/react-vault';
import { text } from '@storybook/addon-knobs';
import { useEffect, useState } from 'react';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { TinyButton } from '../src/frontend/shared/atoms/Button';
import { URLContextExplorer } from '../src/frontend/shared/components/ContentExplorer';
import { MetaDataDisplay } from '../src/frontend/shared/components/MetaDataDisplay';
import { SimpleAtlasViewer } from '../src/frontend/shared/components/SimpleAtlasViewer';
import { ViewExternalContent } from '../src/frontend/shared/components/ViewExternalContent';
import { useResizeLayout } from '../src/frontend/shared/hooks/use-resize-layout';
import ReactTooltip from 'react-tooltip';

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

const OuterLayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
  flex-direction: row;
  background: #ffffff;
  border: 1px solid #bcbcbc;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.17);
  height: 100%;
  overflow: hidden;
  max-height: 100%;
  flex: 1 1 0px;
  min-height: 0;
  min-width: 0;
`;

const NavIconContainer = styled.div<{ $active?: boolean }>`
  &:hover {
    background: #eee;
  }
  border-radius: 3px;
  padding: 0.5em;
  margin: 0.25em;
  width: 2.5em;
  height: 2.5em;
  cursor: pointer;

  svg {
    fill: #666;
    width: 1.4em;
    height: 1.4em;
  }

  ${props =>
    props.$active &&
    css`
      background: #4a64e1;
      svg {
        fill: #fff;
      }
      &:hover {
        background: #4a64e1;
      }
    `}
`;

const LayoutContainer = styled.div`
  display: flex;
  width: 100%;
  max-width: 100%;
`;

const LayoutContent = styled.div`
  background: #fff;
  flex: 1 1 0px;
  min-width: 0;
`;

const LayoutSidebarMenu = styled.div`
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
`;

const LayoutSidebar = styled.div`
  background: #ffffff;
  border-right: 1px solid #bcbcbc;
  overflow: auto;
`;

const LayoutHandle = styled.div<{ $isDragging?: boolean }>`
  width: 6px;
  background: #eee;
  height: 100%;
  user-select: none;
  cursor: col-resize;
  &:hover,
  &:active {
    background: #ddd;
  }

  ${props =>
    props.$isDragging &&
    css`
      &,
      &:active,
      &:hover {
        background-color: blue;
      }
    `}
`;

function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
    </svg>
  );
}

function AnnotationsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z" />
    </svg>
  );
}

function TranscriptionIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M14 17H4v2h10v-2zm6-8H4v2h16V9zM4 15h16v-2H4v2zM4 5v2h16V5H4z" />
    </svg>
  );
}

function ModelDocumentIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
    </svg>
  );
}

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
