import styled, { css } from 'styled-components';

export const SystemBackground = styled.div<{ $rounded?: boolean }>`
  padding: 3em;
  min-height: 100%;
  background: #d0d8e9;

  ${props =>
    props.$rounded &&
    css`
      border-radius: 5px;
    `}
`;

export const SystemThumbnail = styled.div`
  margin-right: 1em;
  width: 3.2em;
  height: 3.2em;
  border-radius: 3px;
  overflow: hidden;
  background: #999;

  img {
    width: 3.2em;
    height: 3.2em;
    object-fit: contain;
    object-position: 50% 50%;
  }
`;

export const SystemMetadata = styled.div`
  flex: 1 1 0px;
`;

export const SystemName = styled.div`
  font-size: 1.2em;
  margin-bottom: 0.5em;
`;

export const SystemVersion = styled.div`
  font-size: 0.8em;
  color: #999;
`;

export const SystemDescription = styled.div`
  font-size: 0.8em;
  margin-bottom: 0.5em;
`;

export const SystemActions = styled.div`
  text-align: right;
`;

export const SystemAction = styled.div<{ $error?: boolean }>`
  margin-bottom: 0.25em;
  ${props =>
    props.$error &&
    css`
      background: #fcb5b5;
      padding: 0.5em;
    `}
`;

export const SystemWarning = styled.div`
  background: #cfc0e5;
  padding: 0.5em;
  margin: 0.25em 0;
`;

export const SystemLinkBar = styled.div`
  font-size: 0.8em;
  display: flex;
  margin-bottom: 0.5em;
  a,
  span {
    margin-right: 0.5em;
    display: block;
  }
`;

export const SystemListingContainer = styled.div`
  max-width: 750px;
  margin: 0 auto;
`;

export const SystemListingItem = styled.div`
  display: flex;
  padding: 1em;
  margin: 1.5em 0;
  background: #ffffff;
  border: 1px solid #c9c9c9;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.13);
  border-radius: 5px;
`;

export const SystemListingThumbnail = styled.div`
  width: 110px;
  margin-right: 1em;
  img {
    display: block;
    object-fit: contain;
    width: 110px;
  }
`;

export const SystemListingLabel = styled.div`
  font-size: 1.1em;
  margin-bottom: 0.8em;
`;

export const SystemListingDescription = styled.div`
  color: #999;
  font-size: 0.85em;
  margin-bottom: 1em;
`;

export const SystemListingMetadata = styled.div`
  flex: 1 1 0px;
`;
