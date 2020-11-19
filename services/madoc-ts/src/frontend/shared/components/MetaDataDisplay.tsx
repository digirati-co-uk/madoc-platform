import { InternationalString } from '@hyperion-framework/types';
import React from 'react';
import styled from 'styled-components';
import { LocaleString } from './LocaleString';

const MetadataDisplayContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  max-height: 80%;
  flex-wrap: wrap;
  padding: 1rem;
  overflow: auto;
`;

const MetaDataKey = styled.p`
  font-size: 12px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
  display: flex;
  align-items: center;
  min-width: 8rem;
  font-weight: bold;
`;

const MetaDataValue = styled.p`
  font-size: 12px;
  color: #000000;
  text-decoration: rgb(0, 0, 0);
`;

const MetadataContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const MetaDataDisplay: React.FC<{
  metadata: Array<{ label: InternationalString; value: InternationalString }>;
  style?: any;
}> = ({ metadata, style }) => {
  return (
    <MetadataDisplayContainer style={style}>
      {metadata && metadata.length
        ? metadata.map((metadataItem, idx: number) => {
            return (
              <MetadataContainer key={idx}>
                <MetaDataKey>
                  <LocaleString>{metadataItem.label}</LocaleString>
                </MetaDataKey>
                <MetaDataValue>
                  <LocaleString>{metadataItem.value}</LocaleString>
                </MetaDataValue>
              </MetadataContainer>
            );
          })
        : 'No metadata to display'}
    </MetadataDisplayContainer>
  );
};
