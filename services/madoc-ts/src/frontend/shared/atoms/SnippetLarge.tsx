import React from 'react';
import styled, { css } from 'styled-components';

export type SnippetLargeProps = {
  label: string | JSX.Element;
  portrait?: boolean;
  subtitle?: string | JSX.Element;
  summary?: string | JSX.Element;
  thumbnail?: string;
  link: string;
  buttonText: string;
  linkAs?: any;
  margin?: boolean;
};

const SnippetContainer = styled.div<{ portrait?: boolean; margin?: boolean }>`
  box-sizing: border-box;
  background: #ffffff;
  border: 1px solid #b9b9b9;
  box-shadow: 0 7px 15px 0 rgba(0, 0, 0, 0.09);
  border-radius: 4px;
  padding: 15px;
  display: flex;
  ${props =>
    props.portrait
      ? css`
          max-width: 200px;
          flex-direction: column;
        `
      : css`
          min-height: 130px;
          max-width: 400px;
          flex-direction: row;
        `};
  ${props =>
    props.margin &&
    css`
      margin-bottom: 1em;
    `};
`;

const SnippetMetadata = styled.div`
  display: flex;
  flex-direction: column;
`;

const SnippetThumbnailContainer = styled.div<{ portrait?: boolean }>`
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;

  ${props =>
    props.portrait
      ? css`
          height: 170px;
          width: 170px;
          margin-bottom: 15px;
        `
      : css`
          height: 100px;
          width: 100px;
          margin-right: 15px;
        `}
`;

const SnippetThumbnail = styled.img`
  display: inline-block;
  object-fit: contain;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
`;

const SnippetLabel = styled.div`
  font-size: 1em;
`;

const SnippetSubtitle = styled.div`
  font-size: 0.8em;
  color: #777;
  margin-bottom: 0.8em;
`;

const SnippetSummary = styled.div`
  font-size: 0.8em;
`;

const SnippetButton = styled.a<{ button?: boolean }>`
  margin-top: auto;
  margin-right: auto;
  display: inline-block;
  width: auto;
  justify-self: flex-end;
  padding: 0.4em 0;
  font-size: 0.8em;
  text-decoration: none;
  color: #3773db;
  ${props =>
    props.button &&
    css`
      padding: 0.4em 0.8em;
      background: #ecf0ff;
      border-radius: 3px;
      &:hover {
        background: #d3dbf5;
      }
    `}
`;

export const SnippetLarge: React.FC<SnippetLargeProps> = props => {
  return (
    <SnippetContainer margin={props.margin} portrait={props.portrait}>
      {props.thumbnail ? (
        <SnippetThumbnailContainer portrait={props.portrait}>
          <SnippetThumbnail src={props.thumbnail} />
        </SnippetThumbnailContainer>
      ) : null}
      <SnippetMetadata>
        <SnippetLabel>{props.label}</SnippetLabel>
        <SnippetSubtitle>{props.subtitle}</SnippetSubtitle>
        {!props.portrait ? <SnippetSummary>{props.summary}</SnippetSummary> : null}
        <SnippetButton as={props.linkAs} button={!props.portrait} href={props.link}>
          {props.buttonText}
        </SnippetButton>
      </SnippetMetadata>
    </SnippetContainer>
  );
};
