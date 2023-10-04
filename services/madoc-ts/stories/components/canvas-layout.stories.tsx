import * as React from 'react';
import styled from 'styled-components';
import { AtlasViewer } from '../../src/frontend/shared/capture-models/editor/content-types/Atlas/Atlas';

export default { title: 'Components / Canvas layout' };

const Breadcrumbs = styled.div`
  background: red;
  padding: 0.5em;
`;

const TitleNavigation = styled.div`
  background: blue;
  height: 4em;
  display: flex;
  align-items: center;
  padding: 0 1em;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const Navigation = styled.div`
  background: #2aabd2;
  margin-left: auto;
`;

const Messaging = styled.div`
  background: green;
`;

const Contributions = styled.div`
  background: mediumvioletred;
  display: flex;
  align-items: flex-start;
`;

const ContributionLeftMenu = styled.div`
  background: #2aabd2;
  position: sticky;
  top: 4em;
  width: 4em;
  height: calc(100vh - 4em);
`;

const ContributionLeftPanel = styled.div`
  background: #2b542c;
  position: sticky;
  top: 4em;
  width: 300px;
  height: calc(100vh - 4em);
`;

const ContributionViewer = styled.div`
  background: #985f0d;
  position: sticky;
  top: 4em;
  flex: 1;
  height: calc(100vh - 4em);
`;

const ContributionModel = styled.div`
  background: #31708f;
  min-width: 0;
  width: 380px;
`;

const FooterContent = styled.div`
  background: pink;
  height: 800px;
`;

const LayoutContainer = styled.div`
  background: white;
`;

const Viewer = styled.div`
  background: red;
`;

const LeftMenuGrid = styled.div`
  display: grid;
  grid-template-columns: 3em 1fr;
  grid-template-rows: repeat(auto-fit, 3em);
  //grid-auto-rows: minmax(3em, auto);
  grid-gap: 0.5em;
  background: green;
  align-self: stretch;
`;

const Icon = styled.button`
  background: blue;
  height: 3em;
  width: 3em;
  grid-column: 1;
`;

const Sidebar = styled.div`
  background: yellow;
  grid-area: sidebar;
  width: 300px;
  grid-column: 2;
  grid-row: auto / span 5;
`;

const SaveButton = styled.div`
  background: red;
  position: sticky;
  bottom: 0;
  padding: 1em;
`;

export const Default = () => {
  // Contains:
  // - Canvas title
  // - Actions/navigation
  // - sidebar
  // - canvas/viewer
  // - contributions panel
  // - footer/extra panel content

  // Features
  // - Canvas title sticks to top along with actions/navigation
  // - The viewer is always in focus, so for long forms you can scroll the page and the viewer will stay in place.
  // - The width of the sidebar can be switch from narrow, normal and wide.
  // - The submit section will be sticky to the bottom of the page.
  // - Once you scroll past the canvas and annotations, you can still see content under

  return (
    <LayoutContainer>
      <Breadcrumbs>Breadcrumbs</Breadcrumbs>
      <TitleNavigation>
        <h3>Title</h3>
        <Navigation>Test</Navigation>
      </TitleNavigation>
      <Messaging>Messaging</Messaging>
      <Contributions>
        <ContributionLeftMenu />
        <ContributionLeftPanel>
          <h3>Panel sidebar</h3>
        </ContributionLeftPanel>
        <ContributionViewer>
          <h3>Viewer</h3>
        </ContributionViewer>
        <ContributionModel>
          <h4>Model</h4>
          <div style={{ height: '200vh' }} />
          <SaveButton>Save changes</SaveButton>
        </ContributionModel>
      </Contributions>
      <FooterContent>Footer</FooterContent>
    </LayoutContainer>
  );
};
