import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import styled from 'styled-components';
import { ImageStripBox } from '../../shared/atoms/ImageStrip';
import { CroppedImage } from '../../shared/atoms/Images';
import { LocaleString, useCreateLocaleString } from '../../shared/components/LocaleString';
import { SingleLineHeading5 } from '../../shared/typography/Heading5';
import { useTranslation } from 'react-i18next';
import { SnippetContainer } from '../../shared/atoms/SnippetLarge';
import { useTopic } from '../pages/loaders/topic-loader';
import { extractIdFromUrn } from '../../../utility/parse-urn';
import { FeaturedResource } from '../../../extensions/enrichment/authority/types';
import { createLink } from '../../shared/utility/create-link';
import { HrefLink } from '../../shared/utility/href-link';

const FeaturedItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;

  a {
    text-decoration: none;
    max-width: 900px;
    width: 100%;
  }
  ${SnippetContainer} {
    width: 100%;
  }
`;
const FeatureCard = styled.div`
  display: flex;
  border: 1px solid;
  margin: 1em;

  h5 {
    color: inherit;
  }
  :hover {
    border-style: dotted;
    cursor: pointer;
    filter: brightness(90%);
  }
`;

export const FeaturedTopicItems: React.FC<{
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
  imageStyle?: string;
}> = ({ cardBackground, textColor, cardBorder, imageStyle }) => {
  const { data } = useTopic();
  const items = data?.featured_resources ? data?.featured_resources : [];
  const createLocaleString = useCreateLocaleString();
  const { t } = useTranslation();
  if (!data) {
    return null;
  }
  if (!items || items.length === 0) {
    return null;
  }
  const RenderItemSnippet = (item: FeaturedResource) => {
    const itemId = item.madoc_id ? item.madoc_id : '';
    const manifestId = extractIdFromUrn(itemId);

    return (
      <HrefLink
        href={createLink({
          manifestId,
        })}
        style={{ textDecoration: 'none' }}
      >
        <FeatureCard
          style={{
            backgroundColor: cardBackground,
            borderColor: cardBorder,
            color: textColor,
          }}
        >
          <ImageStripBox $size="small" $bgColor={cardBackground}>
            <CroppedImage $size="small" $covered={imageStyle === 'covered'}>
              {item.thumbnail ? (
                <img alt={createLocaleString(item.label, t('item thumbnail'))} src={item.thumbnail} />
              ) : null}
            </CroppedImage>
          </ImageStripBox>
          <LocaleString style={{ padding: '1em' }} as={SingleLineHeading5}>
            {item.label}
          </LocaleString>
        </FeatureCard>
      </HrefLink>
    );
  };
  return (
    <>
      <h3 style={{ fontSize: '1.5em', color: textColor, textAlign: 'center' }}>
        Featured on: <LocaleString>{data.title}</LocaleString>
      </h3>
      <FeaturedItemsContainer>
        {items?.map(item => item && <RenderItemSnippet key={item.madoc_id} {...item} />)}
      </FeaturedItemsContainer>
    </>
  );
};

blockEditorFor(FeaturedTopicItems, {
  label: 'Featured Topic Items',
  type: 'default.FeaturedTopicItems',
  defaultProps: {
    header: 'Featured Items',
    cardBackground: '#ffffff',
    textColor: '#002D4B',
    cardBorder: '#002D4B',
    imageStyle: 'cover',
  },
  editor: {
    header: { label: 'label', type: 'text-field' },
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
  anyContext: ['topic'],
  requiredContext: ['topic'],
});
