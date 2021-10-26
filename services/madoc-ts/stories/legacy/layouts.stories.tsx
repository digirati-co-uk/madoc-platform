import { boolean, select } from '@storybook/addon-knobs';
import * as React from 'react';
import { SnippetLarge } from '../../src/frontend/shared/atoms/SnippetLarge';
import StackGrid from 'react-stack-grid';
import { MetaDataDisplay } from '../../src/frontend/shared/components/MetaDataDisplay';
import { MetadataContainer, MetadataLayoutContainer } from '../../src/frontend/shared/layout/MetadataContainer';

export default { title: 'Legacy/Layouts' };

const collections: any[] = [
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7443/74438561.4.jpg',
    buttonText: 'view collection',
  },
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7441/74411378.4.jpg',
    buttonText: 'view collection',
  },
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7443/74438561.4.jpg',
    buttonText: 'view collection',
  },
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7441/74411378.4.jpg',
    buttonText: 'view collection',
  },
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7443/74438561.4.jpg',
    buttonText: 'view collection',
  },
  {
    label: 'Collection name',
    subtitle: 'Collection with 2 items',
    summary: 'Summary of collectino if there is one',
    link: '#',
    thumbnail: 'https://deriv.nls.uk/dcn4/7441/74411378.4.jpg',
    buttonText: 'view collection',
  },
];

const exampleMetadata = [
  {
    label: {
      none: ['Identifier'],
    },
    value: {
      none: ['Digital Store 12603.h.15.'],
    },
  },
  {
    label: {
      none: ['Held by'],
    },
    value: {
      none: ['<span><a href="https://www.bl.uk">The British Library</a></span>'],
    },
  },
  {
    label: {
      none: ['Title'],
    },
    value: {
      none: [
        'The personal history of David Copperfield   / by Charles Dickens ; with sixty-one illustrations by F. Barnard',
      ],
    },
  },
  {
    label: {
      none: ['Creator'],
    },
    value: {
      none: ['Dickens, Charles'],
    },
  },
  {
    label: {
      none: ['Place'],
    },
    value: {
      none: ['London'],
    },
  },
  {
    label: {
      none: ['Publisher'],
    },
    value: {
      none: ['Chapman and Hall'],
    },
  },
  {
    label: {
      none: ['Date'],
    },
    value: {
      none: ['[1872]'],
    },
  },
  {
    label: {
      none: ['Language'],
    },
    value: {
      none: ['English'],
    },
  },
  {
    label: {
      none: ['Catalogue record'],
    },
    value: {
      none: [
        '<a href="http://explore.bl.uk/primo_library/libweb/action/dlDisplay.do?docId=BLL01014809080&amp;vid=BLVU1&amp;lang=en_US&amp;institution=BL">View the catalogue record</a>',
      ],
    },
  },
  {
    label: {
      none: ['Digitised from'],
    },
    value: {
      none: [
        '<a href="http://explore.bl.uk/primo_library/libweb/action/dlDisplay.do?docId=BLL01000930626&amp;vid=BLVU1&amp;lang=en_US&amp;institution=BL">The personal history of David Copperfield</a>',
      ],
    },
  },
  {
    label: {
      none: ['Citation'],
    },
    value: {
      none: [
        '<span>Dickens, Charles, <i>The personal history of David Copperfield   / by Charles Dickens ; with sixty-one illustrations by F. Barnard</i>, (London: Chapman and Hall, [1872]) &lt;http://access.bl.uk/item/viewer/ark:/81055/vdc_00000004216E&gt;</span>',
      ],
    },
  },
  {
    label: {
      none: ['Digitised by'],
    },
    value: {
      none: ['The British Library'],
    },
  },
  {
    label: {
      none: ['A much longer label that will be trimmed'],
    },
    value: {
      none: ['The British Library'],
    },
  },
];

const exampleStructure = {
  items: [
    {
      id: 5,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438562.5/full/256,/0/default.jpg',
      label: {
        none: ['2'],
      },
    },
    {
      id: 6,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438654.5/full/256,/0/default.jpg',
      label: {
        none: ['3'],
      },
    },
    {
      id: 7,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438655.5/full/256,/0/default.jpg',
      label: {
        none: ['4'],
      },
    },
    {
      id: 8,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438656.5/full/256,/0/default.jpg',
      label: {
        none: ['5'],
      },
    },
    {
      id: 9,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438657.5/full/256,/0/default.jpg',
      label: {
        none: ['6'],
      },
    },
    {
      id: 10,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438658.5/full/256,/0/default.jpg',
      label: {
        none: ['7'],
      },
    },
    {
      id: 11,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438659.5/full/256,/0/default.jpg',
      label: {
        none: ['8'],
      },
    },
    {
      id: 12,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438660.5/full/256,/0/default.jpg',
      label: {
        none: ['9'],
      },
    },
    {
      id: 13,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438661.5/full/256,/0/default.jpg',
      label: {
        none: ['10'],
      },
    },
    {
      id: 14,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438662.5/full/256,/0/default.jpg',
      label: {
        none: ['11'],
      },
    },
    {
      id: 15,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438663.5/full/256,/0/default.jpg',
      label: {
        none: ['12'],
      },
    },
    {
      id: 16,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438664.5/full/256,/0/default.jpg',
      label: {
        none: ['13'],
      },
    },
    {
      id: 17,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438665.5/full/256,/0/default.jpg',
      label: {
        none: ['14'],
      },
    },
    {
      id: 18,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438666.5/full/256,/0/default.jpg',
      label: {
        none: ['15'],
      },
    },
    {
      id: 19,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438667.5/full/256,/0/default.jpg',
      label: {
        none: ['16'],
      },
    },
    {
      id: 20,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438668.5/full/256,/0/default.jpg',
      label: {
        none: ['17'],
      },
    },
    {
      id: 21,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438669.5/full/256,/0/default.jpg',
      label: {
        none: ['18'],
      },
    },
    {
      id: 22,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438670.5/full/256,/0/default.jpg',
      label: {
        none: ['19'],
      },
    },
    {
      id: 23,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438671.5/full/256,/0/default.jpg',
      label: {
        none: ['20'],
      },
    },
    {
      id: 24,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438672.5/full/256,/0/default.jpg',
      label: {
        none: ['21'],
      },
    },
    {
      id: 25,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438673.5/full/256,/0/default.jpg',
      label: {
        none: ['22'],
      },
    },
    {
      id: 26,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438674.5/full/256,/0/default.jpg',
      label: {
        none: ['23'],
      },
    },
    {
      id: 27,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438675.5/full/256,/0/default.jpg',
      label: {
        none: ['24'],
      },
    },
    {
      id: 28,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438676.5/full/256,/0/default.jpg',
      label: {
        none: ['25'],
      },
    },
    {
      id: 29,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438677.5/full/256,/0/default.jpg',
      label: {
        none: ['26'],
      },
    },
    {
      id: 30,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438678.5/full/256,/0/default.jpg',
      label: {
        none: ['27'],
      },
    },
    {
      id: 31,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438679.5/full/256,/0/default.jpg',
      label: {
        none: ['28'],
      },
    },
    {
      id: 32,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438680.5/full/256,/0/default.jpg',
      label: {
        none: ['29'],
      },
    },
    {
      id: 33,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438681.5/full/256,/0/default.jpg',
      label: {
        none: ['30'],
      },
    },
    {
      id: 34,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438682.5/full/256,/0/default.jpg',
      label: {
        none: ['31'],
      },
    },
    {
      id: 35,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438683.5/full/256,/0/default.jpg',
      label: {
        none: ['32'],
      },
    },
    {
      id: 36,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438684.5/full/256,/0/default.jpg',
      label: {
        none: ['33'],
      },
    },
    {
      id: 37,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438685.5/full/256,/0/default.jpg',
      label: {
        none: ['34'],
      },
    },
    {
      id: 38,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438686.5/full/256,/0/default.jpg',
      label: {
        none: ['35'],
      },
    },
    {
      id: 39,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438687.5/full/256,/0/default.jpg',
      label: {
        none: ['36'],
      },
    },
    {
      id: 40,
      thumbnail: 'https://view.nls.uk/iiif/7443/74439048.5/full/256,/0/default.jpg',
      label: {
        none: ['37'],
      },
    },
    {
      id: 41,
      thumbnail: 'https://view.nls.uk/iiif/7443/74439050.5/full/256,/0/default.jpg',
      label: {
        none: ['38'],
      },
    },
    {
      id: 42,
      thumbnail: 'https://view.nls.uk/iiif/7443/74439051.5/full/256,/0/default.jpg',
      label: {
        none: ['39'],
      },
    },
    {
      id: 43,
      thumbnail: 'https://view.nls.uk/iiif/7443/74439052.5/full/256,/0/default.jpg',
      label: {
        none: ['40'],
      },
    },
  ],
  originals: [
    {
      id: 4,
      thumbnail: 'https://view.nls.uk/iiif/7443/74438561.5/full/256,/0/default.jpg',
      label: {
        none: ['1'],
      },
    },
  ],
};

export const CollectionListing: React.FC = () => {
  // 2 grid: https://preview.uxpin.com/f6f0dcab8678e674e217208cea7876bb0ad04c74#/pages/133792485/simulate/sitemap?mode=i
  // 1 grid: https://www.digitalcommonwealth.org/collections?f%5Bphysical_location_ssim%5D%5B%5D=Lynn+Public+Library&only_path=true&q=title_info_primary_ssort%3AL%2A&sort=title_info_primary_ssort+asc&view=list
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', true);
  const size = select('Size', ['sm', 'md', 'lg'], 'md');
  const center = boolean('Center', true);
  const buttonRole = select('Button role', ['button', 'link'], 'button');
  const grid = select('Grid', ['1-up', '2-up'], '2-up');

  return (
    <div style={{ background: '#eee' }}>
      <div
        style={{
          display: grid === '1-up' ? 'block' : 'flex',
          maxWidth: 1050,
          margin: 'auto',
          background: '#fff',
          padding: '0 20px',
        }}
      >
        <div style={{ width: '50%', margin: 20 }}>
          <SnippetLarge
            {...collections[0]}
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
          />
        </div>
        <div style={{ width: '50%', margin: 20 }}>
          <SnippetLarge
            {...collections[1]}
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
          />
        </div>
      </div>

      <div
        style={{
          display: grid === '1-up' ? 'block' : 'flex',
          maxWidth: 1050,
          margin: 'auto',
          background: '#fff',
          padding: '0 20px',
        }}
      >
        <div style={{ width: '50%', margin: 20 }}>
          <SnippetLarge
            {...collections[2]}
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
          />
        </div>
        <div style={{ width: '50%', margin: 20 }}>
          <SnippetLarge
            {...collections[3]}
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
          />
        </div>
      </div>
    </div>
  );
};

export const SingleCollectionSimpleGrid: React.FC = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', true);
  const size = select('Size', ['sm', 'md', 'lg'], 'md');
  const center = boolean('Center', true);
  const smallLabel = boolean('Small Label', true);
  const buttonRole = select('Button role', ['button', 'link'], 'link');

  // Collections (of manuscripts)
  // Distinct card layout: https://preview.uxpin.com/f6f0dcab8678e674e217208cea7876bb0ad04c74#/pages/133798349/simulate/sitemap?mode=i
  // Simple grid - http://boxwood.ago.ca/collection
  // Large grid - https://collection.cooperhewitt.org/exhibitions/2318800145/

  return (
    <div>
      {collections.map((collection, key) => (
        <div key={key} style={{ display: 'inline-block', margin: 10 }}>
          <SnippetLarge
            {...collection}
            portrait
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
            smallLabel={smallLabel}
          />
        </div>
      ))}
    </div>
  );
};

export const SingleCollectionListingGrid: React.FC = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', true);
  const size = select('Size', ['sm', 'md', 'lg'], 'lg');
  const center = boolean('Center', true);
  const buttonRole = select('Button role', ['button', 'link'], 'link');

  // Marionette
  //    - https://emuseum.huntington.org/collections/4561/arts-and-crafts-movement/objects
  //    - https://www.si.edu/spotlight/1920
  return (
    <StackGrid columnWidth={250}>
      {collections.map((collection, key) => (
        <div key={key} style={{ margin: 10 }}>
          <SnippetLarge
            {...collection}
            portrait
            lightBackground={lightBackground}
            flat={flat}
            size={size}
            center={center}
            buttonRole={buttonRole}
            containThumbnail={false}
            smallLabel={true}
            fluid
          />
        </div>
      ))}
    </StackGrid>
  );
};

export const ManifestMetadataContainer: React.FC = () => {
  const layout = select(
    'Layout direction',
    ['left-to-right', 'top-to-bottom', 'right-to-left', 'bottom-to-top'],
    'left-to-right'
  );

  const metadataSize = select('Metadata size', ['lg', 'md', 'sm'], 'md');
  return (
    <MetadataLayoutContainer layout={layout}>
      <div style={{ flex: '1 1 0px', background: '#eee' }}>CONTENT</div>
      <MetadataContainer size={metadataSize} vertical={layout === 'top-to-bottom' || layout === 'bottom-to-top'}>
        <MetaDataDisplay
          metadata={exampleMetadata}
          variation={layout === 'left-to-right' || layout === 'right-to-left' ? 'list' : 'table'}
        />
      </MetadataContainer>
    </MetadataLayoutContainer>
  );
};

export const CanvasNavigation: React.FC = () => {
  // Carousel navigation
  // Mini-grid (collapsible) http://boxwood.ago.ca/object/adoration-magi-0
  // Next / Prev navigation

  return <div>Canvas nav</div>;
};

export const CanvasViewLeft: React.FC = () => {
  // - Metadata to the left
  // - Metadata to the right
  // - Metadata below
  // - Required statements (!!)
  // - Inline labels / block labels [toggle]
  // - Room for editorial
  // - Transcription
  return <div>Canvas nav</div>;
};

export const CanvasViewCenter: React.FC = () => {
  // - Metadata to the left
  // - Metadata to the right
  // - Metadata below
  // - Inline labels / block labels [toggle]
  // - Room for editorial
  // - Transcription
  return <div>Canvas nav</div>;
};

export const CanvasViewRight: React.FC = () => {
  // - Metadata to the left
  // - Metadata to the right
  // - Metadata below
  // - Inline labels / block labels [toggle]
  // - Room for editorial
  // - Transcription
  return <div>Canvas nav</div>;
};
