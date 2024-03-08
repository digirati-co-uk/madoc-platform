import { InternationalString } from '@iiif/presentation-3';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
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
import { Topic } from '../../../types/schemas/topics';
import { useTopicItems } from '../hooks/use-topic-items';
import { extractIdFromUrn } from '../../../utility/parse-urn';

interface SingleTopicProps {
  customButtonLabel?: InternationalString;
  topic?: { id: string; slug: string; type: string };
  background?: string;
  data?: Topic;
  radius?: string;
  snippet?: boolean;
  imageStyle?: string;
  cardBackground?: string;
  textColor?: string;
  cardBorder?: string;
}
export function SingleTopic(props: SingleTopicProps) {
  const { t } = useTranslation();
  const createLink = useRelativeLinks();
  const createLocaleString = useCreateLocaleString();
  const { data, customButtonLabel } = props;
  const accessibleTextColor = useAccessibleColor(props.background || '#eeeeee');
  const radius = props.radius ? parseInt(props.radius, 10) : undefined;
  const [{ data: topicItems, isLoading }] = useTopicItems(props.topic?.slug);

  if (!props.topic || !data || !topicItems) {
    return null;
  }

  if (!props.snippet) {
    return (
      <ObjectContainer $background={props.background} $color={accessibleTextColor} $radius={radius}>
        <Heading3>
          <LocaleString
            as={Link}
            to={createLink({
              topic: data.slug,
              topicType: data.type_slug,
            })}
          >
            {data.title}
          </LocaleString>
        </Heading3>
        <Subheading3>{t('{{count}} items', { count: data.tagged_resource_count })}</Subheading3>
        {topicItems.pagination.totalResults === 0 ? null : (
          <ImageStrip>
            {topicItems.results.slice(0, 6).map((item: any) => {
              return (
                <Link
                  to={createLink({
                    topic: data.slug,
                    topicType: data.type_slug,
                    canvasId: extractIdFromUrn(item.contexts.find((e: string) => e.includes('canvas'))),
                    manifestId: extractIdFromUrn(item.contexts.find((e: string) => e.includes('manifest'))),
                  })}
                  key={item.id}
                >
                  <ImageStripBox
                    $size="small"
                    $bgColor={props.cardBackground}
                    $color={props.textColor}
                    $border={props.cardBorder}
                  >
                    <CroppedImage $size="small" $covered={props.imageStyle === 'covered'}>
                      {item.madoc_thumbnail ? (
                        <img alt={createLocaleString(item.label, t('Manifest thumbnail'))} src={item.madoc_thumbnail} />
                      ) : null}
                    </CroppedImage>
                    <LocaleString as={SingleLineHeading5}>{item.label}</LocaleString>
                    {item.canvasCount && (
                      <Subheading5>{t('{{count}} images', { count: item.canvasCount })}</Subheading5>
                    )}
                  </ImageStripBox>
                </Link>
              );
            })}
            {topicItems.results.length > 6 ? (
              <div>
                <Link
                  to={createLink({
                    topic: data.slug,
                    topicType: data.type_slug,
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
                        count: topicItems.pagination.totalResults - 6,
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
              topic: data.slug,
              topicType: data.type_slug,
            })}
          >
            {customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('view topic')}
          </Button>
        </ButtonRow>
      </ObjectContainer>
    );
  }

  const thumbnail = data.other_data?.thumbnail?.url
    ? data.other_data?.thumbnail?.url
    : data.other_data?.main_image?.url;

  return (
    <SnippetLarge
      margin
      label={<LocaleString>{data.label}</LocaleString>}
      subtitle={t('topic with {{count}} ', { count: data.tagged_resource_count })}
      summary={<LocaleString>{data.description}</LocaleString>}
      linkAs={HrefLink}
      thumbnail={thumbnail}
      buttonText={customButtonLabel ? <LocaleString>{customButtonLabel}</LocaleString> : t('view topic')}
      link={createLink({ topic: data.id })}
      {...props}
    />
  );
}

// @ts-ignore
blockEditorFor(SingleTopic, {
  label: 'Single topic',
  type: 'SingleTopic',
  defaultProps: {
    customButtonLabel: '',
    topic: null,
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
      name: 'getSiteTopic',
      creator: props => {
        return props.topic ? [props.topic.type, props.topic.slug] : undefined;
      },
      mapToProps: (props, data) => {
        return { ...props, data };
      },
    },
  ],
  editor: {
    customButtonLabel: { type: 'text-field', label: 'Custom button label' },
    background: { type: 'color-field', label: 'Background color', defaultValue: '#eeeeee' },
    radius: { type: 'text-field', label: 'Border radius', defaultValue: '' },
    topic: {
      label: 'Topic',
      type: 'topic-explorer',
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
