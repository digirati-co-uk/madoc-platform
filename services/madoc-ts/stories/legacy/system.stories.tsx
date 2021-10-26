import { Button, ButtonRow } from '../../src/frontend/shared/navigation/Button';
import * as React from 'react';
import {
  SystemListingDescription,
  SystemListingContainer,
  SystemListingMetadata,
  SystemListingThumbnail,
  SystemListingItem,
  SystemListingLabel,
} from '../../src/frontend/shared/atoms/SystemUI';

export default { title: 'Legacy/System UI' };

export const ListingProjectTemplates = () => {
  return (
    <>
      <SystemListingContainer>
        <SystemListingItem>
          <SystemListingThumbnail>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA5IiBoZWlnaHQ9IjEwOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgICAgPHJlY3Qgc3Ryb2tlPSIjRTdFOUVDIiBzdHJva2Utd2lkdGg9IjIiIHg9IjEiIHk9IjEiIHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iNSIvPgogICAgICAgICAgPHBhdGggZmlsbD0iIzAwMCIgZD0iTTE3IDI4LjRoNzUuNHY1LjNIMTd6Ii8+CiAgICAgICAgICA8cGF0aCBmaWxsPSIjNUI3OEU1IiBkPSJNMTcgMTkuNmg3NS40djUuM0gxN3pNMTcgMjguNGg3NS40djUuM0gxN3oiLz4KICAgICAgICAgIDxwYXRoIGZpbGw9IiNFN0U5RUMiIGQ9Ik0xNyAzNy4xaDc1LjR2NS4zSDE3eiIvPgogICAgICAgICAgPHBhdGggZmlsbD0iIzVCNzhFNSIgZD0iTTE3IDM3LjFoMzcuOXY1LjNIMTd6Ii8+CiAgICAgICAgICA8cGF0aCBmaWxsPSIjRTdFOUVDIiBkPSJNMTcgNDYuMWg3NS40djUuM0gxN3pNMTcgNjYuMWg3NS40djUuM0gxN3pNMTcgNzQuOGg3NS40djUuM0gxN3pNMTcgNTQuOWgyNS43djUuM0gxN3pNMTcuOSA4My44aDM2LjZ2NC4zSDE3Ljl6Ii8+CiAgICAgICAgPC9nPgogICAgICA8L3N2Zz4KICAgIA==" />
          </SystemListingThumbnail>
          <SystemListingMetadata>
            <SystemListingLabel>Crowdsourced Transcription</SystemListingLabel>
            <SystemListingDescription>
              Content added to this project will be available to browse and users will be able to pick up and transcribe
              individual images. These images will be submitted for review, where you will be able to accept, reject or
              merge contributions.
            </SystemListingDescription>
            <ButtonRow>
              <Button $primary>Start transcribing</Button>
              <Button $link>View documentation</Button>
            </ButtonRow>
          </SystemListingMetadata>
        </SystemListingItem>
        <SystemListingItem>
          <SystemListingThumbnail>
            <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTA5IiBoZWlnaHQ9IjEwOSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgICAgICA8ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgICAgPHJlY3Qgc3Ryb2tlPSIjRTdFOUVDIiBzdHJva2Utd2lkdGg9IjIiIHg9IjEiIHk9IjEiIHdpZHRoPSIxMDciIGhlaWdodD0iMTA3IiByeD0iNSIvPgogICAgICAgICAgPHBhdGggZmlsbD0iIzAwMCIgZD0iTTE3IDI4LjRoNzUuNHY1LjNIMTd6Ii8+CiAgICAgICAgICA8cGF0aCBmaWxsPSIjNUI3OEU1IiBkPSJNMTcgMTkuNmg3NS40djUuM0gxN3pNMTcgMjguNGg3NS40djUuM0gxN3oiLz4KICAgICAgICAgIDxwYXRoIGZpbGw9IiNFN0U5RUMiIGQ9Ik0xNyAzNy4xaDc1LjR2NS4zSDE3eiIvPgogICAgICAgICAgPHBhdGggZmlsbD0iIzVCNzhFNSIgZD0iTTE3IDM3LjFoMzcuOXY1LjNIMTd6Ii8+CiAgICAgICAgICA8cGF0aCBmaWxsPSIjRTdFOUVDIiBkPSJNMTcgNDYuMWg3NS40djUuM0gxN3pNMTcgNjYuMWg3NS40djUuM0gxN3pNMTcgNzQuOGg3NS40djUuM0gxN3pNMTcgNTQuOWgyNS43djUuM0gxN3pNMTcuOSA4My44aDM2LjZ2NC4zSDE3Ljl6Ii8+CiAgICAgICAgPC9nPgogICAgICA8L3N2Zz4KICAgIA==" />
          </SystemListingThumbnail>
          <SystemListingMetadata>
            <SystemListingLabel>Crowdsourced Transcription</SystemListingLabel>
            <SystemListingDescription>
              Content added to this project will be available to browse and users will be able to pick up and transcribe
              individual images. These images will be submitted for review, where you will be able to accept, reject or
              merge contributions.
            </SystemListingDescription>
            <ButtonRow>
              <Button $primary>Start transcribing</Button>
              <Button $link>View documentation</Button>
            </ButtonRow>
          </SystemListingMetadata>
        </SystemListingItem>
      </SystemListingContainer>
    </>
  );
};
