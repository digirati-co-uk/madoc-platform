import React, { useRef } from 'react';
import { useInfiniteQuery } from 'react-query';
import { Button } from '../../../frontend/shared/navigation/Button';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { useApi } from '../../../frontend/shared/hooks/use-api';
import { useInfiniteAction } from '../../../frontend/site/hooks/use-infinite-action';
import { useTranslation } from 'react-i18next';
import { InfoMessage } from '../../../frontend/shared/callouts/InfoMessage';
import validate from 'uuid-validate';

export type MediaExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: {
    id: string;
    url?: string;
    image: string;
    thumbnail: string;
  } | null;
  valueAsString?: boolean;
  onlyThumbnail?: boolean;
};

export const MediaExplorer: React.FC<MediaExplorerProps & {
  updateValue: (value: MediaExplorerProps['value']) => void;
}> = props => {
  const api = useApi();
  const { t } = useTranslation();
  const container = useRef<HTMLDivElement>(null);
  const { data: pages, fetchMore, canFetchMore, isFetchingMore } = useInfiniteQuery(
    ['media-explorer', {}],
    async (key, _, vars: { page?: number } = { page: 0 }) => {
      return api.media.listMedia(vars.page);
    },
    {
      getFetchMore: lastPage => {
        if (lastPage.pagination.totalPages === 0 || lastPage.pagination.totalPages === lastPage.pagination.page) {
          return undefined;
        }
        return {
          page: lastPage.pagination.page + 1,
        };
      },
    }
  );
  const [loadMoreButton] = useInfiniteAction({
    fetchMore,
    canFetchMore,
    isFetchingMore,
    container: container,
  });

  const v = props.value?.url ? props.value.url : props.value;
  const chosenMedia = parseChosenMedia(v);
  if (chosenMedia) {
    return (
      <div>
        <ImageStripBox $size="small">
          <CroppedImage>{chosenMedia.thumbnail ? <img src={chosenMedia.thumbnail} alt="thumb" /> : null}</CroppedImage>
        </ImageStripBox>
        <Button onClick={() => props.updateValue(null)}>Choose another image</Button>
      </div>
    );
  }

  return (
    <div ref={container} style={{ maxHeight: 500, overflowY: 'scroll' }}>
      {!pages || pages[0].pagination.totalResults === 0 ? (
        <InfoMessage>{t('There are no images to chose from, you can upload media in the admin interface')}</InfoMessage>
      ) : (
        <ImageGrid $size="small">
          {pages?.map((page, key) => {
            return (
              <React.Fragment key={key}>
                {page.mediaItems.map(media => (
                  <ImageStripBox
                    key={media.id}
                    onClick={() => {
                      if (props.valueAsString) {
                        if (props.onlyThumbnail) {
                          props.updateValue(media.thumbnail as any);
                        } else {
                          props.updateValue(media.publicLink as any);
                        }
                      } else {
                        props.updateValue({ id: media.id, image: media.publicLink, thumbnail: media.thumbnail });
                      }
                    }}
                  >
                    <CroppedImage>{media.thumbnail ? <img src={media.thumbnail} alt="thumb" /> : null}</CroppedImage>
                    <Heading5>{media.displayName}</Heading5>
                  </ImageStripBox>
                ))}
              </React.Fragment>
            );
          })}
          <Button ref={loadMoreButton} onClick={() => fetchMore()} style={{ display: canFetchMore ? 'block' : 'none' }}>
            Load more
          </Button>
        </ImageGrid>
      )}
    </div>
  );
};

function parseChosenMedia(
  media:
    | null
    | string
    | {
        id: string;
        image: string;
        thumbnail: string;
      }
): null | { id: string; image: string; thumbnail: string } {
  if (!media) {
    return null;
  }
  if (typeof media === 'string') {
    const parsed = /public\/storage\/urn:madoc:site:(\d)+\/media\/public\/([A-Za-z0-9-]+)\/(.*)/.exec(media);
    if (!parsed) {
      return null;
    }

    const [, siteId, imageId, fileName] = parsed;
    const [, ...parts] = fileName.split('.').reverse();
    const fileNameWithoutExtension = parts.reverse().join('.');

    return {
      id: imageId,
      image: `/public/storage/urn:madoc:site:${siteId}/media/public/${imageId}/${fileName}`,
      thumbnail: `/public/storage/urn:madoc:site:${siteId}/media/public/${imageId}/256/${fileNameWithoutExtension}.jpg`,
    };
  }
  return media;
}
