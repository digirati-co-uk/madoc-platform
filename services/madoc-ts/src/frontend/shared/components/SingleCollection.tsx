import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { CollectionFull } from '../../../types/schemas/collection-full';
import { useRelativeLinks } from '../../site/hooks/use-relative-links';
import { CroppedImage } from '../atoms/Images';
import { ImageStrip, ImageStripBox } from '../atoms/ImageStrip';
import { ObjectContainer } from '../atoms/ObjectContainer';
import { SnippetLarge } from '../atoms/SnippetLarge';
import { useAccessibleColor } from '../hooks/use-accessible-color';
import { Button, ButtonRow } from '../navigation/Button';
import { MoreContainer, MoreDot, MoreIconContainer, MoreLabel } from '../navigation/MoreButton';
import { Heading3, Subheading3 } from '../typography/Heading3';
import { SingleLineHeading5, Subheading5 } from '../typography/Heading5';
import { HrefLink } from '../utility/href-link';
import { LocaleString, useCreateLocaleString } from './LocaleString';

interface SingleCollectionProps {
  customButtonLabel?: InternationalString;
  collection?: { id: string; label: InternationalString };
  background?: string;
  data?: CollectionFull & { collection: CollectionFull['collection'] & { itemCount: number } };
  radius?: string;
  snippet?: boolean;
  imageStyle?: string;
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
}
export function SingleCollection(props: SingleCollectionProps) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();

  const { data, customButtonLabel } = props;
  const accessibleTextColor = useAccessibleColor(props.background || '#eeeeee');
  const radius = props.radius ? parseInt(props.radius, 10) : undefined;

  const collection = data?.collection;

  if (!props.collection || !data || !collection) {
    return null;
  }

  if (!props.snippet) {
    return (
      <ObjectContainer $background={props.background} $color={accessibleTextColor} $radius={radius}>
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
                <ImageStripBox
                  $size="small"
                  $bgColor={props.cardBackground}
                  $color={props.textColor}
                  $border={props.cardBorder}
                >
                  <CroppedImage $size="small" $covered={props.imageStyle === 'covered'}>
                    {manifest.thumbnail ? (
                      <img alt={createLocaleString(manifest.label, t('Manifest thumbnail'))} src={manifest.thumbnail} />
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
            {customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('view collection')}
          </Button>
        </ButtonRow>
      </ObjectContainer>
    );
  }

  if (!data) {
    return (
      <SnippetLarge
        margin
        label={'...'}
        subtitle={t('Collection')}
        summary={'...'}
        linkAs={HrefLink}
        buttonText={customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('view collection')}
        link={createLink({ collectionId: collection.id })}
        {...props}
      />
    );
  }

  const thumbnail = data.collection.thumbnail
    ? data.collection.thumbnail
    : data.collection.items[0] && data.collection.items[0].thumbnail
    ? data.collection.items[0].thumbnail
    : undefined;

  return (
    <SnippetLarge
      margin
      label={<LocaleString>{data.collection.label}</LocaleString>}
      subtitle={t('Collection with {{count}} manifests', { count: data.pagination.totalResults })}
      summary={<LocaleString>{data.collection.summary}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText={customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('view collection')}
      link={createLink({ collectionId: collection.id })}
      {...props}
    />
  );
}

blockEditorFor(SingleCollection, {
  label: 'Single collection',
  type: 'SingleCollection',
  defaultProps: {
    customButtonLabel: '',
    collection: null,
    background: null,
    radius: null,
    snippet: false,
    cardBackground: '',
    textColor: '',
    cardBorder: '',
    imageStyle: 'fit',
  },
  hooks: [
    {
      name: 'getSiteCollection',
      creator: props => (props.collection ? [props.collection.id] : undefined),
      mapToProps: (props, data) => {
        return { ...props, data };
      },
    },
  ],
  editor: {
    customButtonLabel: { type: 'text-field', label: 'Custom button label' },
    background: { type: 'color-field', label: 'Background color', defaultValue: '#eeeeee' },
    radius: { type: 'text-field', label: 'Border radius', defaultValue: '' },
    collection: {
      label: 'Collection',
      type: 'collection-explorer',
    },
    snippet: { type: 'checkbox-field', label: 'Layout', inlineLabel: 'Show as snippet' },
    cardBackground: { label: 'Card background color', type: 'color-field' },
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
  requiredContext: [],
  anyContext: [],
});
