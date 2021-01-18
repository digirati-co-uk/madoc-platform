import { InternationalString } from '@hyperion-framework/types';
import React from 'react';
import styled, { css } from 'styled-components';
import { LocaleString } from './LocaleString';

const MetadataDisplayContainer = styled.table<{ $variation?: 'list' | 'table'; $size?: 'lg' | 'md' | 'sm' }>`
  font-size: ${props =>
    ({
      lg: '1em',
      md: '0.8em',
      sm: '0.65em',
    }[props.$size || 'md'])};

  border-spacing: 0;
  max-width: 100%;
  width: 100%;
  flex-wrap: wrap;
  padding: 1em;
  overflow: hidden;
`;

const MetaDataKey = styled.td<{
  $variation?: 'list' | 'table';
  $labelStyle?: 'muted' | 'bold' | 'caps' | 'small-caps';
  $labelWidth?: number;
  $bordered?: boolean;
}>`
  ${props =>
    ({
      table: css`
        max-width: 12em;
        margin-right: 1em;
        padding: 0.7em;
        min-width: ${() => `${props.$labelWidth || 16}em`};

        ${() =>
          props.$bordered &&
          css`
            border-right: 1px solid #eee;
          `}
      `,
      list: css`
        display: block;
        margin-bottom: 0.5em;
        padding-bottom: 0.25em;
        ${() =>
          props.$bordered &&
          css`
            border-bottom: 1px solid #eee;
          `}
      `,
    }[props.$variation || 'table'])}

  ${props =>
    ({
      muted: css`
        color: #999;
        font-size: 1em;
      `,
      bold: css`
        color: #000000;
        font-weight: bold;
        font-size: 1em;
      `,
      caps: css`
        text-transform: uppercase;
        color: #999;
        font-size: 1em;
      `,
      'small-caps': css`
        font-size: 0.85em;
        text-transform: uppercase;
        font-weight: bold;
      `,
    }[props.$labelStyle || 'bold'])}


  text-decoration: none;
  align-items: center;
  & span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
`;

const MetaDataValue = styled.td<{ $variation?: 'list' | 'table' }>`
  ${props =>
    ({
      table: css`
        padding: 0.7em 1em;
      `,
      list: css`
        display: block;
        padding: 0;
        margin-bottom: 1em;
      `,
    }[props.$variation || 'table'])}

  font-size: 1em;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  word-break: break-word;

  a {
    color: #4070d9;
  }
`;

const MetadataContainer = styled.tr<{ $variation?: 'list' | 'table' }>`
  ${props =>
    ({
      table: css``,
      list: css`
        display: block;
        margin-bottom: 1.5em;
      `,
    }[props.$variation || 'table'])}
`;

export const MetaDataDisplay: React.FC<{
  metadata: Array<{ label: InternationalString; value: InternationalString }>;
  variation?: 'table' | 'list';
  labelStyle?: 'muted' | 'bold' | 'caps' | 'small-caps';
  labelWidth?: number;
  bordered?: boolean;
}> = ({ metadata, variation = 'table', labelWidth = 16, bordered, labelStyle }) => {
  return (
    <MetadataDisplayContainer $variation={variation}>
      {metadata && metadata.length
        ? metadata.map((metadataItem, idx: number) => {
            return (
              <MetadataContainer key={idx} $variation={variation}>
                <MetaDataKey
                  $labelStyle={labelStyle}
                  $variation={variation}
                  $labelWidth={labelWidth}
                  $bordered={bordered}
                >
                  <LocaleString enableDangerouslySetInnerHTML>{metadataItem.label}</LocaleString>
                </MetaDataKey>
                <MetaDataValue $variation={variation}>
                  <LocaleString enableDangerouslySetInnerHTML>{metadataItem.value}</LocaleString>
                </MetaDataValue>
              </MetadataContainer>
            );
          })
        : 'No metadata to display'}
    </MetadataDisplayContainer>
  );
};
