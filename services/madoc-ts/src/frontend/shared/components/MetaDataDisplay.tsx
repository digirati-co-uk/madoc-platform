import { InternationalString } from '@hyperion-framework/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { LocaleString } from './LocaleString';
import { FacetConfig } from './MetadataFacetEditor';

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
  config?: FacetConfig[];
  metadata?: Array<{ label: InternationalString; value: InternationalString }>;
  style?: any;
}> = ({ config, metadata = [], style }) => {
  const { t } = useTranslation();
  const metadataKeyMap = useMemo(() => {
    const flatKeys = (config || []).reduce((state, i) => {
      return [...state, ...i.keys];
    }, [] as string[]);

    const map: { [key: string]: Array<{ label: InternationalString; value: InternationalString }> } = {};
    for (const item of metadata) {
      const labels = item.label ? Object.values(item.label) : [];
      for (const label of labels) {
        if (label && label.length && flatKeys.indexOf(`metadata.${label[0]}`) !== -1) {
          const key = `metadata.${label[0]}`;
          map[key] = map[key] ? map[key] : [];
          map[key].push(item);
          break;
        }
      }
    }
    return map;
  }, [config, metadata]);

  if (config && config.length) {
    return (
      <MetadataDisplayContainer style={style}>
        {config.map((configItem, idx: number) => {
          const values: any[] = [];

          for (const key of configItem.keys) {
            for (const item of metadataKeyMap[key] || []) {
              values.push(
                <div key={idx + '__' + key}>
                  <LocaleString enableDangerouslySetInnerHTML>{item.value}</LocaleString>
                </div>
              );
            }
          }

          if (values.length === 0) {
            return null;
          }

          return (
            <MetadataContainer key={idx}>
              <MetaDataKey>
                <LocaleString enableDangerouslySetInnerHTML>{configItem.label}</LocaleString>
              </MetaDataKey>
              <MetaDataValue>{values}</MetaDataValue>
            </MetadataContainer>
          );
        })}
      </MetadataDisplayContainer>
    );
  }

  return (
    <MetadataDisplayContainer style={style}>
      {metadata && metadata.length
        ? metadata.map((metadataItem, idx: number) => {
            return (
              <MetadataContainer key={idx}>
                <MetaDataKey>
                  <LocaleString enableDangerouslySetInnerHTML>{metadataItem.label}</LocaleString>
                </MetaDataKey>
                <MetaDataValue>
                  <LocaleString enableDangerouslySetInnerHTML>{metadataItem.value}</LocaleString>
                </MetaDataValue>
              </MetadataContainer>
            );
          })
        : t('No metadata to display')}
    </MetadataDisplayContainer>
  );
};
