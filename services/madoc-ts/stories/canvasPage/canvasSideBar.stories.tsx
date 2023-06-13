import * as React from 'react';
import {
  LayoutSidebarMenu,
  NavIconContainer,
  NavIconNotifcation,
} from '../../src/frontend/shared/layout/LayoutContainer';
import { ViewDocument } from '../../src/frontend/shared/capture-models/inspector/ViewDocument';
import { DynamicVaultContext } from '../../src/frontend/shared/capture-models/new/DynamicVaultContext';
import { useState } from 'react';;
import { ModelDocumentIcon } from '../../src/frontend/shared/icons/ModelDocumentIcon';
import { InfoIcon } from '../../src/frontend/shared/icons/InfoIcon';
import { AnnotationsIcon } from '../../src/frontend/shared/icons/AnnotationsIcon';
import { TranscriptionIcon } from '../../src/frontend/shared/icons/TranscriptionIcon';
import { PersonIcon } from '../../src/frontend/shared/icons/PersonIcon';
import { parse } from 'query-string';
// @ts-ignore
import mad1200fixture1 from '../../fixtures/96-jira/MAD-1200-1.json';
export default {
  title: 'Components / Canvas sidebar',
};

const Template: any = (props: any) => {
  const [k, setK] = useState(props.initialTab || 0);
  const captureModel = mad1200fixture1;
  const target = {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
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

        {/* Document */}
        <NavIconContainer $active={k === 3} onClick={() => setK(3)}>
          <NavIconNotifcation>1</NavIconNotifcation>
          <ModelDocumentIcon />
        </NavIconContainer>

        {/* Revisions */}
        <NavIconContainer $active={k === 4} onClick={() => setK(4)}>
          <NavIconNotifcation>1</NavIconNotifcation>
          <PersonIcon />
        </NavIconContainer>
      </LayoutSidebarMenu>

      <div>
        <DynamicVaultContext {...target}>
          <ViewDocument
            key={JSON.stringify(captureModel.document)}
            hideEmpty
            document={captureModel.document}
          />
        </DynamicVaultContext>
      </div>
    </div>
  );
};

export const DefaultCanvasSideBar = Template.bind({});
