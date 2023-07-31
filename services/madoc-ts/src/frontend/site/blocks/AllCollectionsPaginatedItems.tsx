import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { Heading3, Subheading3 } from '../../shared/typography/Heading3';
import { SingleLineHeading5, Subheading5 } from '../../shared/typography/Heading5';
import { CroppedImage } from '../../shared/atoms/Images';
import { ImageStrip, ImageStripBox } from '../../shared/atoms/ImageStrip';
import { MoreContainer, MoreDot, MoreIconContainer, MoreLabel } from '../../shared/navigation/MoreButton';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { HrefLink } from '../../shared/utility/href-link';
import { useCollectionList } from '../hooks/use-collection-list';
import { useRelativeLinks } from '../hooks/use-relative-links';

const CollectionContainer = styled.div`
  background: #eee;
  margin-bottom: 20px;
  padding: 20px 20px 40px;
`;

export const AllCollectionsPaginatedItems: React.FC = () => {
  const { resolvedData: data } = useCollectionList();
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();

  return (
    <>
      {data?.collections.map(collection => {
        return (
          <CollectionContainer key={collection.id}>
            <Heading3>
              <LocaleString
                as={Link}
                to={createLink({
                  collectionId: collection.id,
                })}
              >
                {collection.label}
              </LocaleString>
            </Heading3>
            <Subheading3>{t('{{count}} items', { count: collection.itemCount })}</Subheading3>
            {collection.items.length === 0 ? null : (
              <ImageStrip>
                {collection.items.map((manifest: any) => (
                  <Link
                    to={createLink({
                      collectionId: collection.id,
                      manifestId: manifest.id,
                    })}
                    key={manifest.id}
                  >
                    <ImageStripBox $size="small">
                      <CroppedImage $size="small">
                        {manifest.thumbnail ? (
                          <img
                            alt={createLocaleString(manifest.label, t('Manifest thumbnail'))}
                            src={manifest.thumbnail}
                          />
                        ) : null}
                      </CroppedImage>
                      <LocaleString as={SingleLineHeading5}>{manifest.label}</LocaleString>
                      <Subheading5>{t('{{count}} images', { count: manifest.canvasCount })}</Subheading5>
                    </ImageStripBox>
                  </Link>
                ))}
                {collection.items.length < (collection.itemCount || collection.items.length) ? (
                  <div>
                    <Link
                      to={createLink({
                        collectionId: collection.id,
                      })}
                    >
                      <MoreContainer>
                        <MoreIconContainer>
                          <MoreDot />
                          <MoreDot />
                          <MoreDot />
                        </MoreIconContainer>
                        <MoreLabel>
                          {t('{{count}} more', {
                            count: (collection.itemCount || collection.items.length) - collection.items.length,
                          })}
                        </MoreLabel>
                      </MoreContainer>
                    </Link>
                  </div>
                ) : null}
              </ImageStrip>
            )}
            <ButtonRow>
              <Button
                $primary
                as={HrefLink}
                href={createLink({
                  collectionId: collection.id,
                })}
              >
                {t('view collection')}
              </Button>
            </ButtonRow>
          </CollectionContainer>
        );
      })}
    </>
  );
};

blockEditorFor(AllCollectionsPaginatedItems, {
  type: 'default.AllCollectionsPaginatedItems',
  label: 'All collections grid',
  internal: true,
  source: {
    name: 'All collections page',
    type: 'custom-page',
    id: '/collections',
  },
  anyContext: [],
  requiredContext: [],
  editor: {},
});
