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

export type MediaExplorerProps = {
  id: string;
  label: string;
  type: string;
  value: {
    id: string;
    image: string;
    thumbnail: string;
  } | null;
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

  if (props.value) {
    const chosenMedia = props.value;
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
                    onClick={() =>
                      props.updateValue({ id: media.id, image: media.publicLink, thumbnail: media.thumbnail })
                    }
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
