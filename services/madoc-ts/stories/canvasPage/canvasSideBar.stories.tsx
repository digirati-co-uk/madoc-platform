import * as React from 'react';
import {
  LayoutSidebarMenu,
  NavIconContainer,
  NavIconNotifcation,
} from '../../src/frontend/shared/layout/LayoutContainer';
import { ViewDocument } from '../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { DynamicVaultContext } from '../../src/frontend/shared/capture-models/new/DynamicVaultContext';
import { useState } from 'react';
import { ModelDocumentIcon } from '../../src/frontend/shared/icons/ModelDocumentIcon';
import { InfoIcon } from '../../src/frontend/shared/icons/InfoIcon';
import { AnnotationsIcon } from '../../src/frontend/shared/icons/AnnotationsIcon';
import { TranscriptionIcon } from '../../src/frontend/shared/icons/TranscriptionIcon';
import { PersonIcon } from '../../src/frontend/shared/icons/PersonIcon';
import { MetadataEmptyState } from '../../src/frontend/shared/atoms/MetadataConfiguration';
import { RevisionListItemContainer, RevisionStatus } from '../../src/frontend/shared/components/RevisionList';
import { useTranslation } from 'react-i18next';
import { Subheading1 } from '../../src/frontend/shared/typography/Heading1';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import mad1200fixture1 from '../../fixtures/96-jira/MAD-1200-1.json';

import { MetadataPanel } from './metadataPanel';
import { AnnotationsPanel } from './annotationsPanel';
import { TranscriptionsPanel } from './transcriptionsPanel';
import { PersonalNotesPanel } from './personalNotesPanel';
import { DownloadsPanel } from './downloadsPanel';
import { LockIcon } from '../../src/frontend/shared/icons/LockIcon';
import { DownloadIcon } from '../../src/frontend/shared/icons/DownloadIcon';

export default {
  title: 'Components / Canvas sidebar',
};

const Template: any = (sidebarProps: any) => {
  const [k, setK] = useState(0);
  const captureModel = mad1200fixture1;
  const { t } = useTranslation();
  const target = {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  };

  const personalNotes = { enabled: true, count: 2 };
  const downloads = {
    enabled: true,
    count: 2,
    items: [
      {
        id: 'atvubjnl5421',
        label: { none: ['first'] },
        type: 'pdf',
        url: 'www.madoc.pdf',
      },
      {
        id: 'hgdugtrebjnl56531',
        label: { none: ['Seccond'] },
        type: 'svg',
        url: 'www.madoc.svg',
      },
    ],
  };

  return (
    <div style={{ display: 'flex' }}>
      <LayoutSidebarMenu>
        {/* Metadata */}
        <NavIconContainer $active={k === 0} onClick={() => setK(0)}>
          <InfoIcon />
        </NavIconContainer>

        {/* Annotations */}
        <NavIconContainer $active={k === 1} onClick={() => setK(1)}>
          <AnnotationsIcon />
        </NavIconContainer>

        {/* Transcriptions */}
        <NavIconContainer $active={k === 2} onClick={() => setK(2)}>
          <TranscriptionIcon />
        </NavIconContainer>

        {/* Translations */}
        {/*<NavIconContainer $active={k === 3} onClick={() => setK(3)}>*/}
        {/*  <TranscriptionIcon />*/}
        {/*</NavIconContainer>*/}

        {/* Documents */}
        <NavIconContainer $active={k === 4} onClick={() => setK(4)}>
          <ModelDocumentIcon />
        </NavIconContainer>

        {/* Revisions */}
        <NavIconContainer $active={k === 5} onClick={() => setK(5)}>
          <PersonIcon />
        </NavIconContainer>

        {/* personalNotes */}
        {personalNotes.enabled && (
          <NavIconContainer $active={k === 6} onClick={() => setK(6)}>
            <LockIcon />
            <NavIconNotifcation>{personalNotes.count}</NavIconNotifcation>
          </NavIconContainer>
        )}

        {/* downloads */}
        {downloads.enabled && (
          <NavIconContainer $active={k === 7} onClick={() => setK(7)}>
            <DownloadIcon />
            <NavIconNotifcation>{downloads.count}</NavIconNotifcation>
          </NavIconContainer>
        )}
      </LayoutSidebarMenu>

      <div>
        {k === 0 ? (
          <MetadataPanel metadata={sidebarProps.metadata} />
        ) : k === 1 ? (
          <AnnotationsPanel annotations={sidebarProps.annotations} />
        ) : k === 2 ? (
          <TranscriptionsPanel transcriptions={sidebarProps.transcriptions} />
        ) : k === 3 ? (
          <p>Translations </p>
        ) : k === 4 ? (
          <DynamicVaultContext {...target}>
            <ViewDocument key={JSON.stringify(captureModel.document)} hideEmpty document={captureModel.document} />
          </DynamicVaultContext>
        ) : k === 5 ? (
          <DynamicVaultContext {...target}>
            <div style={{ padding: '0 .5em' }}>
              {captureModel.revisions && captureModel.revisions.length ? (
                <>
                  {captureModel.revisions.map(rev => (
                    <RevisionListItemContainer key={rev.id}>
                      <RevisionStatus $status={rev.status} />
                      <Subheading1>
                        <Subheading1>Label: {rev.label}</Subheading1>
                        <Subheading1>Id: {rev.id}</Subheading1>
                        {rev.authors ? <p>{rev.authors[0]}</p> : <span style={{ color: '#999' }}>unknown</span>}
                      </Subheading1>
                      <ViewDocument
                        fluidImage
                        document={captureModel.document}
                        padding={false}
                        hideTitle
                        highlightRevisionChanges={rev.id}
                      />
                    </RevisionListItemContainer>
                  ))}
                </>
              ) : (
                <MetadataEmptyState style={{ marginTop: 100 }}>No Revisions</MetadataEmptyState>
              )}
            </div>
          </DynamicVaultContext>
        ) : k === 6 ? (
          <PersonalNotesPanel personalNotes={personalNotes} />
        ) : (
          <DownloadsPanel downloads={downloads} />
        )}
      </div>
    </div>
  );
};

export const DefaultCanvasSideBar = Template.bind({});
