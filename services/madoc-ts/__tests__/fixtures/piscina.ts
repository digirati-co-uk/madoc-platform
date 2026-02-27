export const piscina = {
  '@context': 'http://iiif.io/api/presentation/3/context.json',
  id: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/manifest',
  type: 'Manifest',
  label: {
    en: ['Piscina, Hoja 23'],
  },
  thumbnail: [
    {
      id: 'https://dl.library.ucla.edu/iiif/2/ark%3A%2F21198%2Fzz002dwx3v/full/200,200/0/default.jpg',
      type: 'Image',
      format: 'image/jpeg',
      height: 200,
      width: 200,
    },
  ],
  items: [
    {
      id: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/canvas/1',
      type: 'Canvas',
      width: 5322,
      height: 7338,
      items: [
        {
          id: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/annotation-page/1',
          type: 'AnnotationPage',
          items: [
            {
              id: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/annotation/1',
              type: 'Annotation',
              motivation: 'painting',
              body: {
                id: 'https://dl.library.ucla.edu/iiif/2/ark%3A%2F21198%2Fzz002dwx3v/full/max/0/default.jpg',
                type: 'Image',
                format: 'image/jpeg',
                height: 7338,
                width: 5322,
                service: [
                  {
                    id: 'https://dl.library.ucla.edu/iiif/2/ark%3A%2F21198%2Fzz002dwx3v',
                    type: 'ImageService3',
                    profile: 'level2',
                  },
                ],
              },
              target: 'https://digital.library.ucla.edu/catalog/ark:/21198/zz002dwx3v/canvas/1',
            },
          ],
        },
      ],
    },
  ],
};
