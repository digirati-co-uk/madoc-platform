import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasStatus } from '../../shared/atoms/CanvasStatus';
import { SingleLineHeading5, Subheading5 } from '../../shared/typography/Heading5';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { useSubjectMap } from '../../shared/hooks/use-subject-map';
import { useRelativeLinks } from '../hooks/use-relative-links';
import { CollectionLoader } from '../pages/loaders/collection-loader';

export const CollectionPaginatedItems: React.FC = () => {
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
    <ImageGrid>
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
          <ImageGridItem $size="large">
            <CroppedImage $size="large">
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
          </ImageGridItem>
        </Link>
      ))}
    </ImageGrid>
  );
};

blockEditorFor(CollectionPaginatedItems, {
  type: 'default.CollectionPaginatedItems',
  label: 'Collection paginated items',
  anyContext: ['collection'],
  requiredContext: ['collection'],
  editor: {},
});
