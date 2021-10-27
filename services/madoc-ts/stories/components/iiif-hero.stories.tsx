import * as React from 'react';
import { IIIFHero } from '../../src/frontend/shared/components/IIIFHero';

export default {
  title: 'Components / IIIF Hero image',
  component: IIIFHero,
  args: {
    title: { en: ['Discover our collection'] },
    description: { en: ['From Libraries around the world'] },
    button: {
      title: { en: ['Explore'] },
      link: '#',
      isExternal: true,
    },
    backgroundImage: 'https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/290,400/0/default.jpg',
    asset: {
      label: { de: ['Wunder der Vererbung'] },
      attribution: { en: ['Wellcome Collection'] },
      backgroundColor: '#342145',
      thumbnails: [
        'https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/290,400/0/default.jpg',
        'https://iiif.wellcomecollection.org/thumbs/b18035723_0003.JP2/full/145,200/0/default.jpg',
        'https://iiif.wellcomecollection.org/thumbs/b18035723_0004.JP2/full/145,200/0/default.jpg',
        'https://iiif.wellcomecollection.org/thumbs/b18035723_0005.JP2/full/145,200/0/default.jpg',
        'https://iiif.wellcomecollection.org/thumbs/b18035723_0006.JP2/full/145,200/0/default.jpg',
      ],
    },
  },
};

const Template = (props: any) => <IIIFHero {...props} />;

export const DefaultHeroImage = Template.bind({});
DefaultHeroImage.args = {};

export const HeroNoAssets = Template.bind({});
HeroNoAssets.args = {
  backgroundImage: 'https://iiif.wellcomecollection.org/thumbs/b18035723_0001.JP2/full/290,400/0/default.jpg',
  asset: null,
};
