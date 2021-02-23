import { boolean, number, select } from '@storybook/addon-knobs';
import * as React from 'react';
import { MetaDataDisplay } from '../src/frontend/shared/components/MetaDataDisplay';

export default { title: 'metadata Display' };

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

export const Metadata_Display = () => {
  const variation = select('Style variation', ['table', 'list'], 'table');
  const labelStyle = select('Label style', ['bold', 'muted', 'caps', 'small-caps'], 'bold');
  const labelWidth = number('Label width', 16);
  const bordered = boolean('Bordered', false);

  return (
    <MetaDataDisplay
      metadata={exampleMetadata}
      variation={variation}
      labelStyle={labelStyle}
      labelWidth={labelWidth}
      bordered={bordered}
    />
  );
};

export const UniversalViewerStyle = () => {
  return <MetaDataDisplay metadata={exampleMetadata} variation={'list'} labelStyle={'bold'} bordered={true} />;
};

export const InlineMuted = () => {
  return <MetaDataDisplay metadata={exampleMetadata} variation={'table'} labelStyle={'muted'} />;
};

export const SmallCaps = () => {
  return <MetaDataDisplay metadata={exampleMetadata} variation={'list'} labelStyle={'small-caps'} />;
};
