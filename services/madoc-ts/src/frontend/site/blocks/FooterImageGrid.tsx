import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { HrefLink } from '../../shared/utility/href-link';

const isExternalUrl = (url: string) => /^https?:\/\//i.test(url);

interface ImageType {
  text?: string;
  logo?: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
  url?: string;
  labelOptions?: {
    hide?: boolean;
    inline?: boolean;
  };
  imgOptions?: {
    padding?: boolean;
    margin?: boolean;
  };
  maxHeight?: string;
}

interface FooterImageGridProps {
  images?: ImageType[];
  colNum?: string;
  rowNum?: string;
}

export function FooterImageGrid({ images, colNum, rowNum }: FooterImageGridProps) {
  const Logo = (image: ImageType) => (
    <div
      className={`h-auto w-full ${image.labelOptions?.inline ? 'flex items-end' : ''}`}
      style={{ padding: image.imgOptions?.padding ? '0.5em' : '', margin: image.imgOptions?.margin ? '0 0.5em' : '' }}
    >
      <img
        className="max-h-[80px]"
        style={{ maxHeight: `${image.maxHeight}px` }}
        alt={image.text}
        src={image?.logo?.image}
      />
      {image.labelOptions?.hide ? null : <div className="px-[0.5em] text-inherit no-underline">{image.text}</div>}
    </div>
  );
  return (
    <div
      className="grid justify-between gap-[1em]"
      style={{
        gridTemplateColumns: colNum ? `repeat(${colNum}, auto)` : 'repeat(2, auto)',
        gridTemplateRows: rowNum ? `repeat(${rowNum}, auto)` : 'repeat(2, auto)',
      }}
    >
      {images
        ? images.map((image, i) => {
            return (
              <div key={i}>
                {image.url ? (
                  isExternalUrl(image.url) ? (
                    <a href={image.url}>
                      <Logo {...image} />
                    </a>
                  ) : (
                    <HrefLink href={image.url}>
                      <Logo {...image} />
                    </HrefLink>
                  )
                ) : (
                  <Logo {...image} />
                )}
              </div>
            );
          })
        : null}
    </div>
  );
}

blockEditorFor(FooterImageGrid, {
  type: 'default.FooterImageGrid',
  label: 'Image Grid for footer',
  requiredContext: ['project'],
  defaultProps: {
    images: {
      text: '',
      url: '',
      logo: null,
      textInline: false,
      maxHeight: '80',
      labelOptions: {
        hide: false,
        inline: false,
      },
      imgOptions: {
        padding: false,
        margin: false,
      },
    },
    colNum: '4',
    rowNum: '2',
  },
  editor: {
    images: {
      allowMultiple: true,
      label: 'logo',
      pluralLabel: 'Logos',
      labelledBy: 'text',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'images.text': {
      label: 'text',
      type: 'text-field',
    },
    'images.labelOptions': {
      label: 'Label options',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Hide label?',
          value: 'hide',
        },
        {
          label: 'Show label inline?',
          value: 'inline',
        },
      ],
    },
    'images.logo': {
      label: 'image',
      type: 'madoc-media-explorer',
    },
    'images.maxHeight': {
      label: 'Logo max height',
      type: 'text-field',
      description: 'Must be a valid number (pixels)',
    },
    'images.imgOptions': {
      label: 'Logo options',
      description: 'View options for the logo',
      type: 'checkbox-list-field',
      options: [
        {
          label: 'Padding around logo',
          value: 'padding',
        },
        {
          label: 'Margin left and right',
          value: 'margin',
        },
      ],
    },
    'images.url': {
      label: 'URL Link for image',
      type: 'text-field',
      description: 'Use a root-relative path for internal links, or an absolute URL including http:// or https://.',
    },
    colNum: {
      label: 'Number of columns in grid',
      type: 'text-field',
    },
    rowNum: {
      label: 'Number of rows in grid',
      type: 'text-field',
    },
  },
});
