import { stringify } from 'query-string';
import React from 'react';
import styled, { css } from 'styled-components';
import { BtnColor, buttonColor } from '../variables';

export type SnippetLargeProps = {
  label: string | JSX.Element;
  portrait?: boolean;
  subtitle?: string | JSX.Element;
  summary?: string | JSX.Element;
  thumbnail?: string | null;
  link: string;
  buttonText: string | JSX.Element;
  linkAs?: any;
  flat?: boolean;
  margin?: boolean;
  lightBackground?: boolean;
  size?: 'lg' | 'md' | 'sm';
  center?: boolean;
  buttonRole?: 'button' | 'link';
  containThumbnail?: boolean;
  stackedThumbnail?: boolean;
  smallLabel?: boolean;
  fluid?: boolean;
  interactive?: boolean;
  query?: any;
};

const sizeMap = {
  lg: '1.5em',
  md: '1.25em',
  sm: '1em',
};

const SnippetButton = styled.a<{ role?: string; $center?: boolean }>`
  margin-top: auto;
  ${props =>
    props.$center &&
    css`
      margin-left: auto;
    `}
  margin-right: auto;
  display: inline-block;
  width: auto;
  justify-self: flex-end;
  padding: 0.4em 0;
  font-size: 0.8rem;
  text-decoration: none;
  color: ${buttonColor};

  ${props =>
    props.role === 'button' &&
    css`
      padding: 0.4em 0.8em;
      border-radius: 3px;
      border: 1px solid ${buttonColor};
      &:hover {
        filter: brightness(90%);
      }
      &:focus {
        background: ${buttonColor};
        color: ${BtnColor};
      }
    `}
`;

export const SnippetContainer = styled.div<{
  portrait?: boolean;
  margin?: boolean;
  flat?: boolean;
  size?: 'lg' | 'md' | 'sm';
  $center?: boolean;
  interactive?: boolean;
}>`
  box-sizing: border-box;
  background: #ffffff;
  font-size: ${props => (props.size ? sizeMap[props.size] : sizeMap.sm)};
  
  ${props =>
    props.interactive &&
    css`
      cursor: pointer;
      &:hover {
        background: #edf0fe;
        ${SnippetButton} {
          &[role='button'] {
            background: #fff;
          }
        }
      }
    `}
  
  ${props =>
    props.$center &&
    css`
      align-items: center;
      text-align: center;
    `}
  ${props =>
    !props.flat &&
    css`
      border: 1px solid #e7e7e7;
      box-shadow: 0 4px 10px 0 rgba(0, 0, 0, 0.09);
    `}
  border-radius: 4px;
  padding: 1rem;
  display: flex;
  ${props =>
    props.portrait
      ? css`
          //max-width: 13em;
          flex-direction: column;
        `
      : css`
          min-height: 8em;
          max-width: 26em;
          flex-direction: row;
        `};
  ${props =>
    props.margin &&
    css`
      margin-bottom: 1rem;
    `};
`;

const SnippetMetadata = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 0px;
  text-decoration: none;
`;

const SnippetUnconstrainedContainer = styled.div<{ portrait?: boolean; fluid?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  ${props =>
    props.fluid &&
    css`
      width: 100%;
    `}

  ${props =>
    props.portrait
      ? css`
          margin-bottom: 1rem;
        `
      : css`
          margin-right: 1rem;
        `}
`;

export const SnippetThumbnailContainer = styled(SnippetUnconstrainedContainer)<{
  fluid?: boolean;
  portrait?: boolean;
  lightBackground?: boolean;
  stackedThumbnail?: boolean;
}>`
  background: ${props => (props.lightBackground ? '#EEEEEE' : '#000')};

  img {
    z-index: 3;
  }

  ${props =>
    props.stackedThumbnail
      ? css`
          position: relative;
          padding: 0.4em;
          background-color: transparent;

          img {
            border: 2px solid #fff;
            box-shadow: 0px 2px 5px 0 rgba(0, 0, 0, 0.2);
            background: ${() => (props.lightBackground ? '#EEEEEE' : '#000')};
          }

          &:after {
            content: '';
            background: #999;
            position: absolute;
            border: 2px solid #fff;
            box-shadow: 0px 2px 5px 0 rgba(0, 0, 0, 0.2);
            top: 0.4em;
            bottom: 0.4em;
            left: 0.4em;
            right: 0.4em;
            transform: rotate(4deg);
            z-index: 2;
          }
          &:before {
            content: '';
            background: #666;
            position: absolute;
            border: 2px solid #fff;
            box-shadow: 0px 2px 5px 0 rgba(0, 0, 0, 0.2);
            top: 0.4em;
            bottom: 0.4em;
            left: 0.4em;
            right: 0.4em;
            transform: rotate(-3deg);
            z-index: 2;
          }

          ${() =>
            props.fluid
              ? ''
              : props.portrait
              ? css`
                  margin-bottom: 1rem;
                  max-height: 11em;
                  max-width: 11em;
                `
              : css`
                  max-height: 6em;
                  max-width: 6em;
                  margin-right: 1rem;
                `}
        `
      : props.fluid
      ? ''
      : props.portrait
      ? css`
          height: 11em;
          width: 11em;
          margin-bottom: 1rem;
        `
      : css`
          height: 6em;
          width: 6em;
          margin-right: 1rem;
          min-width: 6em;
        `}
`;

export const SnippetThumbnail = styled.img`
  display: inline-block;
  object-fit: contain;
  flex-shrink: 0;
  width: 100%;
  height: 100%;
`;

const SnippetLabel = styled.div<{ small?: boolean }>`
  font-size: ${props => (props.small ? '1rem' : '1em')};
  text-decoration: none;
`;

const SnippetSubtitle = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-bottom: 0.8em;
  text-decoration: none;
`;

const SnippetSummary = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.8em;
  text-decoration: none;
`;

export const SnippetLarge: React.FC<SnippetLargeProps> = props => {
  const buttonRole = props.buttonRole ? props.buttonRole : props.portrait ? 'link' : 'button';
  const containThumbnail = props.containThumbnail !== false;
  return (
    <SnippetContainer
      margin={props.margin}
      portrait={props.portrait}
      flat={props.flat}
      size={props.size}
      $center={props.center}
      interactive={props.interactive}
    >
      {props.thumbnail ? (
        containThumbnail ? (
          <SnippetThumbnailContainer
            portrait={props.portrait}
            lightBackground={props.lightBackground}
            stackedThumbnail={props.stackedThumbnail}
          >
            <SnippetThumbnail src={props.thumbnail} />
          </SnippetThumbnailContainer>
        ) : (
          <SnippetUnconstrainedContainer fluid={props.fluid} portrait={props.portrait}>
            <SnippetThumbnail src={props.thumbnail} />
          </SnippetUnconstrainedContainer>
        )
      ) : null}
      <SnippetMetadata>
        <SnippetLabel small={props.smallLabel}>{props.label}</SnippetLabel>
        <SnippetSubtitle>{props.subtitle}</SnippetSubtitle>
        {!props.portrait ? <SnippetSummary>{props.summary}</SnippetSummary> : null}
        <SnippetButton
          as={props.linkAs}
          role={buttonRole}
          href={props.query ? `${props.link}?${stringify(props.query)}` : props.link}
          $center={props.center}
        >
          {props.buttonText}
        </SnippetButton>
      </SnippetMetadata>
    </SnippetContainer>
  );
};
