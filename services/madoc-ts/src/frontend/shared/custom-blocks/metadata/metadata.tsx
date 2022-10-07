import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React, { useState } from 'react';
import { MetaDataWrapper, MetaDataAccordian, Btn, MetaItemData, MetaItem, MetaLabel } from './metadata.style';
import { useTranslation } from 'react-i18next';
import { useSiteMetadataConfiguration } from '../../hooks/use-site-metadata-configuration';
import { usePaginatedData } from '../../hooks/use-data';
import { ManifestLoader } from '../../../site/pages/loaders/manifest-loader';
import { useRouteContext } from '../../../site/hooks/use-route-context';
import { Database, ChevronDown } from '@styled-icons/entypo/';

export function MetaData() {
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  const { manifestId } = useRouteContext();
  const { resolvedData: data } = usePaginatedData(ManifestLoader, undefined, { enabled: !!manifestId });
  const { data: metadataConfig } = useSiteMetadataConfiguration({ enabled: true });

  if (!data || !metadataConfig) {
    return null;
  }
  const metadata = data.manifest.metadata;

  if (!metadata || !metadata.length) {
    return null;
  }

  // console.log(result);
  return (
    <MetaDataWrapper expanded={expanded}>
      <Btn onClick={() => setExpanded(!expanded)}>
        <ChevronDown /> SHOW METADATA
      </Btn>
      <MetaDataAccordian>
        {metadata && metadata.length
          ? metadata.map((metadataItem, idx: number) => {
              if (!metadataItem) {
                return null; // null items.
              }
              return (
                <MetaItem key={idx}>
                  <Database />
                  <MetaLabel>{metadataItem.label.none} :</MetaLabel>
                  <MetaItemData>{metadataItem.value.none} </MetaItemData>
                </MetaItem>
              );
            })
          : t('No metadata to display')}
      </MetaDataAccordian>
    </MetaDataWrapper>
  );
}

blockEditorFor(MetaData, {
  type: 'Metadata',
  label: 'ida metadata',
  editor: {},
});
