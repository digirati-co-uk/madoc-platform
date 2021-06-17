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
  a {
    margin-right: 0.5em;
    display: block;
  }
`;
