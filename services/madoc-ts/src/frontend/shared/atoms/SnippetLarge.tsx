import { stringify } from 'query-string';
import React from 'react';
import styled from 'styled-components';

export type SnippetLargeProps = {
  label: string | React.ReactNode;
  portrait?: boolean;
  subtitle?: string | React.ReactNode;
  summary?: string | React.ReactNode;
  thumbnail?: string | null;
  link: string;
  buttonText: string | React.ReactNode;
  linkAs?: any;
  lightBackground?: boolean;
  size?: 'lg' | 'md' | 'sm';
  center?: boolean;
  buttonRole?: 'button' | 'link';
  hideButton?: boolean;
  stackedThumbnail?: boolean;
  smallLabel?: boolean;
  interactive?: boolean;
  query?: any;
  placeholderIcon?: React.ReactNode;
};

const sizeMap = {
  lg: '1.5em',
  md: '1.25em',
  sm: '1em',
};

const SnippetButton = styled.a<{ $center?: boolean }>`
  margin-left: ${props => (props.$center ? 'auto' : '')};
  justify-self: flex-end;
  padding: 0.4em 0;
  font-size: 0.9rem;
  text-decoration: none;
  color: #3773db;
  flex-shrink: 0;

  &:link,
  &:visited {
    color: #3773db;
  }

  &:hover {
    color: #0f306c;
  }

  &[data-is-role='button'] {
    padding: 0.4em 0.8em;
    background: #ecf0ff;
    color: #3773db;
    border-radius: 3px;

    &:hover {
      background: #d3dbf5;
      color: #3773db;
    }

    &:focus {
      background: #3773db;
      color: #fff;
    }
  }
`;

export const SnippetContainer = styled.div<{
  size?: 'lg' | 'md' | 'sm';
}>`
  box-sizing: border-box;
  background: #ffffff;
  font-size: ${props => (props.size ? sizeMap[props.size] : sizeMap.sm)};
  border-radius: 1px;
  padding: 1rem 0.6rem;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 8em;
  max-width: 39em;

  flex-direction: row;
  border: 1px solid #999;

  &[data-is-interactive='true'] {
    cursor: pointer;
    &:hover {
      background: #edf0fe;
      ${SnippetButton} {
        &[role='button'] {
          background: #fff;
        }
      }
    }
  }
  &[data-is-center='true'] {
    align-items: center;
    text-align: center;
  }
  &[data-is-portrait='true'] {
    flex-direction: column;
    align-items: start;
    max-width: 20em;
    padding: 0.5rem 0.6rem;
  }
`;

const SnippetMetadata = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5em;
  width: 100%;
`;

export const SnippetThumbnailContainer = styled.div<{
  lightBackground?: boolean;
}>`
  display: flex;
  justify-content: center;
  overflow: hidden;
  background: ${props => (props.lightBackground ? '#EEEEEE' : '#000')};
  height: 6em;
  width: 6em;
  margin-right: 1rem;
  min-width: 6em;

  img {
    z-index: 3;
  }

  &[data-is-stacked='true'] {
    position: relative;
    padding: 0.4em;
    background-color: transparent;
    max-height: 6em;
    max-width: 6em;
    margin-right: 1rem;

    img {
      border: 2px solid #fff;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
      background: ${props => (props.lightBackground ? '#EEEEEE' : '#000')};
    }

    &:after {
      content: '';
      background: #999;
      position: absolute;
      border: 2px solid #fff;
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
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
      box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.2);
      top: 0.4em;
      bottom: 0.4em;
      left: 0.4em;
      right: 0.4em;
      transform: rotate(-3deg);
      z-index: 2;
    }

    &[data-is-portrait='true'] {
      margin-bottom: 1rem;
      max-height: 11em;
      width: 11em;
    }
  }

  &[data-is-portrait='true'] {
    margin-bottom: 1rem;
    margin-right: 0;
    height: 9em;
    width: 100%
  }

  &[data-is-icon='true'] {
    background: #DDDDDD;
    align-items: center;
    svg {
      height: 48px;
      width: 48px;
      fill: #888888;
    }
  }
}
`;

export const SnippetThumbnail = styled.img`
  display: inline-block;
  object-fit: cover;
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
  color: #6b6b6b;
  text-decoration: none;
`;

const SnippetSummary = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.8em;
  text-decoration: none;
`;

export const SnippetLarge: React.FC<SnippetLargeProps> = props => {
  return (
    <SnippetContainer
      size={props.size}
      data-is-portrait={props.portrait}
      data-is-center={props.center}
      data-is-interactive={props.interactive}
    >
      {props.thumbnail ? (
        <SnippetThumbnailContainer
          lightBackground={props.lightBackground}
          data-is-stacked={props.stackedThumbnail}
          data-is-portrait={props.portrait}
        >
          <SnippetThumbnail src={props.thumbnail} />
        </SnippetThumbnailContainer>
      ) : props.placeholderIcon ? (
        <SnippetThumbnailContainer
          data-is-portrait={props.portrait}
          data-is-icon={true}
        >
          {props.placeholderIcon}
        </SnippetThumbnailContainer>
      ) : null}
      <SnippetMetadata>
        <SnippetLabel small={props.smallLabel}>{props.label}</SnippetLabel>
        <SnippetSubtitle>{props.subtitle}</SnippetSubtitle>
        {!props.portrait ? <SnippetSummary>{props.summary}</SnippetSummary> : null}
      </SnippetMetadata>
      {!props.hideButton && (
        <SnippetButton
          as={props.linkAs}
          data-is-role={props.buttonRole}
          href={props.query ? `${props.link}?${stringify(props.query)}` : props.link}
          $center={props.center}
        >
          {props.buttonText}
        </SnippetButton>
      )}
    </SnippetContainer>
  );
};
