import React from 'react';
import { Link } from 'react-router-dom';
import { MediaListResponse } from '../../../../../types/media';
import { Heading5 } from '../../../../shared/atoms/Heading5';
import { ImageGrid } from '../../../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { FileDropzone } from '../../../../shared/components/FileDropzone';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../../types';
import { Pagination } from '../../../molecules/Pagination';

type ViewMediaType = {
  query: { page?: string };
  params: {};
  variables: { page: number };
  data: MediaListResponse;
};

export const ListMedia: UniversalComponent<ViewMediaType> = createUniversalComponent<ViewMediaType>(
  () => {
    const { data } = useData(ListMedia);

    return (
      <div>
        <h2>View files</h2>
        <FileDropzone />

        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
        <ImageGrid>
          {data?.mediaItems.map((media, idx) => (
            <Link key={`${media.id}_${idx}`} to={`/media/${media.id}`}>
              <ImageStripBox>
                <CroppedImage>{media.thumbnail ? <img src={media.thumbnail} /> : null}</CroppedImage>
                <Heading5>{media.displayName}</Heading5>
              </ImageStripBox>
            </Link>
          ))}
        </ImageGrid>

        <Pagination
          page={data ? data.pagination.page : 1}
          totalPages={data ? data.pagination.totalPages : 1}
          stale={!data}
        />
      </div>
    );
  },
  {
    getKey: (params, query) => {
      return ['admin-view-media', { page: query.page ? Number(query.page) : 1 }];
    },
    getData: (key, vars, api) => {
      // return api.pageBlocks.getAllPages();
      return api.media.listMedia(vars.page);
    },
  }
);
