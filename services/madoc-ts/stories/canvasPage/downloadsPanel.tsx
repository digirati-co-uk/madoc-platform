import * as React from 'react';
import { MetadataEmptyState } from '../../src/frontend/shared/atoms/MetadataConfiguration';
import { InternationalString } from '@iiif/presentation-3';
import { LocaleString } from '../../src';
import { SimpleCard } from '../../src/frontend/shared/atoms/SimpleCard';
import { HrefLink } from '../../src/frontend/shared/utility/href-link';
import { Subheading3 } from '../../src/frontend/shared/typography/Heading3';
import { DownloadIcon } from '../../src/frontend/shared/icons/DownloadIcon';

interface downloadsType {
  enabled?: boolean;
  count: number;
  items: {
    id: string;
    label: InternationalString;
    type: string;
    url: string;
  }[];
}
export const DownloadsPanel: React.FC<{ downloads?: downloadsType }> = ({ downloads }) => {
  if (!downloads || !downloads.items.length) {
    return <MetadataEmptyState>No downloads</MetadataEmptyState>;
  }
  return (
    <>
      {downloads.items.map(download => (
        <SimpleCard as={HrefLink} href={download.url} key={download.id}>
          <div style={{ display: 'flex' }}>
            <div>
              <LocaleString>{download.label}</LocaleString>
              <Subheading3>{download.type}</Subheading3>
            </div>
            <DownloadIcon style={{ margin: '0.5em', fontSize: '2em'}} />
          </div>
        </SimpleCard>
      ))}
    </>
  );
};
