import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { SingleLineHeading5, Subheading5 } from '../../shared/typography/Heading5';
import { ImageGrid } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';

export function CollectionPaginatedItems(props: {
  background?: string;
  list?: boolean;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}) {
  const { t } = useTranslation();
  const { data } = usePaginatedData(CollectionLoader);
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();

  const collection = data?.collection;
  const collectionSubjects = data?.subjects;
  const [subjectMap] = useSubjectMap(collectionSubjects);

  if (!collection) {
    return null;
  }

  return (
    <ImageGrid data-view-list={props.list}>
      {collection.items.map((manifest, idx) => (
        <Link
          key={`${manifest.id}_${idx}`}
          to={createLink(
            manifest.type === 'collection'
              ? {
                  collectionId: manifest.id,
                }
              : {
                  manifestId: manifest.id,
                }
          )}
        >
          <ImageStripBox
            data-view-list={props.list}
            $border={props.cardBorder ? props.cardBorder : 'transparent'}
            $color={props.textColor}
            $bgColor={props.background}
          >
            <CroppedImage $covered={props.imageStyle === 'covered'}>
              {manifest.thumbnail ? (
                <img alt={createLocaleString(manifest.label, t('Untitled manifest'))} src={manifest.thumbnail} />
              ) : null}
            </CroppedImage>
            {collectionSubjects && subjectMap ? <CanvasStatus status={subjectMap[manifest.id]} /> : null}

            <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
            <Subheading5>
              {manifest.type === 'manifest'
                ? t('{{count}} images', { count: manifest.canvasCount })
                : t('{{count}} manifests', { count: manifest.canvasCount })}
            </Subheading5>
          </ImageStripBox>
        </Link>
      ))}
    </ImageGrid>
  );
}

blockEditorFor(CollectionPaginatedItems, {
  type: 'default.CollectionPaginatedItems',
  label: 'Collection paginated items',
  anyContext: ['collection'],
  requiredContext: ['collection'],
  defaultProps: {
    background: '',
    list: false,
    textColor: '',
    cardBorder: '#999',
    imageStyle: 'fit',
  },
  editor: {
    list: { type: 'checkbox-field', label: 'View', inlineLabel: 'Display as list' },
    background: { label: 'Card background color', type: 'color-field' },
    textColor: { label: 'Card text color', type: 'color-field' },
    cardBorder: { label: 'Card border', type: 'color-field' },
    imageStyle: {
      label: 'Image Style',
      type: 'dropdown-field',
      options: [
        { value: 'covered', text: 'covered' },
        { value: 'fit', text: 'fit' },
      ],
    },
  },
});
