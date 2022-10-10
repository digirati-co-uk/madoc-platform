import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React, { useState } from 'react';

import { MetaDataWrapper, MetaDataAccordian, Btn, MetaItemData, MetaItem, MetaLabel } from './metadata.style';
import { Database, ChevronDown } from '@styled-icons/entypo/';
import { useTranslation } from 'react-i18next';
import { LocaleString } from '../../components/LocaleString';

export function IDAManifestMetadata() {
  const metadata = [{ label: 'test', value: 'testv' }];
  const [expanded, setExpanded] = useState(false);
  const { t } = useTranslation();
  if (!metadata || !metadata.length) {
    return null;
  }

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

                  <MetaLabel>
                    <LocaleString enableDangerouslySetInnerHTML>{metadataItem.label}</LocaleString> :
                  </MetaLabel>
                  <MetaItemData>
                    <LocaleString enableDangerouslySetInnerHTML>{metadataItem.value}</LocaleString>
                  </MetaItemData>
                </MetaItem>
              );
            })
          : t('No metadata to display')}
      </MetaDataAccordian>
    </MetaDataWrapper>
  );
}
blockEditorFor(IDAManifestMetadata, {
  type: 'Metadata',
  label: 'IDA Manifest metadata',
  anyContext: ['manifest', 'canvas'],
  requiredContext: ['manifest'],
  editor: {},
  defaultProps: {},
});
