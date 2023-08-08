import { CanvasContext, useVaultEffect, VaultProvider } from 'react-iiif-vault';
import { CanvasNormalized } from '@iiif/presentation-3';
import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { MediaItem } from '../../../../../types/media';
import { Button, ButtonRow } from '../../../../shared/navigation/Button';
import { Heading5 } from '../../../../shared/typography/Heading5';
import { CroppedImage } from '../../../../shared/atoms/Images';
import { ImageStripBox } from '../../../../shared/atoms/ImageStrip';
import { ModalButton } from '../../../../shared/components/Modal';
import { SimpleAtlasViewer } from '../../../../shared/features/SimpleAtlasViewer';
import { useApi } from '../../../../shared/hooks/use-api';
import { useData } from '../../../../shared/hooks/use-data';
import { useLocationQuery } from '../../../../shared/hooks/use-location-query';
import { useSite } from '../../../../shared/hooks/use-site';
import { Spinner } from '../../../../shared/icons/Spinner';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useViewerHeight } from '../../../../site/hooks/use-viewer-height';
import { UniversalComponent } from '../../../../types';

type ViewMediaType = {
  query: {};
  params: { mediaId: string };
  variables: { mediaId: string };
  data: { media: MediaItem };
};

const AtlasViewerImage: React.FC<{ media: MediaItem }> = ({ media }) => {
  const [canvasRef, setCanvasRef] = useState<CanvasNormalized>();
  const { id } = useSite();
  const height = useViewerHeight();
  const serviceId = `/public/storage/iiif/0/urn:madoc:site:${id}/media/public/${media.id}/${media.fileName}`;
  const canvas = {
    source: {
      id: `https://madoc.io/${media.id}`,
      '@id': `https://madoc.io/${media.id}`,
      '@type': 'sc:Canvas',
      height: media.metadata.height,
      width: media.metadata.width,
      images: [
        {
          '@id': `https://madoc.io/${media.id}/annotation`,
          '@type': 'oa:Annotation',
          motivation: 'sc:painting',
          on: `https://madoc.io/${media.id}`,
          resource: {
            '@id': media.publicLink,
            '@type': 'dctypes:Image',
            format: 'image/jpeg',
            height: media.metadata.height,
            width: media.metadata.width,
            service: {
              '@context': 'http://iiif.io/api/image/2/context.json',
              '@id': serviceId,
              profile: 'http://iiif.io/api/image/2/profiles/level0.json',
            },
          },
        },
      ],
      label: 'Test image.',
    },
  };

  useVaultEffect(
    vault => {
      if (canvas) {
        vault
          .load(
            canvas.source.id || canvas.source['@id'],
            canvas.source['@id']
              ? {
                  '@context': 'http://iiif.io/api/presentation/2/context.json',
                  ...canvas.source,
                }
              : canvas.source
          )
          .then(c => {
            setCanvasRef(c as any);
          });
      }
    },
    [canvas]
  );

  if (!media.metadata.width || !media.metadata.height) {
    return null;
  }

  return (
    <>
      {canvasRef ? (
        <CanvasContext canvas={canvasRef.id}>
          <SimpleAtlasViewer style={{ height }} />
        </CanvasContext>
      ) : null}
    </>
  );
};

export const ViewMedia: UniversalComponent<ViewMediaType> = createUniversalComponent<ViewMediaType>(
  () => {
    const { data } = useData(ViewMedia);
    const api = useApi();
    const navigate = useNavigate();
    const { iiif } = useLocationQuery<any>();

    const [deleteMedia, deleteMediaStatus] = useMutation(async () => {
      if (data) {
        await api.media.deleteMedia(data.media.id);
      }
      navigate(`/media`, { replace: true });
    });

    if (!data) {
      return <Spinner />;
    }

    const media = data.media;

    return (
      <div>
        <ImageStripBox $size="large">
          <CroppedImage $size="large">{media.thumbnail ? <img src={media.thumbnail} /> : null}</CroppedImage>
          <Heading5>{media.displayName}</Heading5>
        </ImageStripBox>
        <ButtonRow>
          <Button as="a" target="_blank" href={media.publicLink}>
            Open full image
          </Button>
          <ModalButton
            title="Are you sure you want to delete this media?"
            render={() => {
              return <div>If you are using this media somewhere it may break</div>;
            }}
            renderFooter={({ close }) => {
              return (
                <ButtonRow $noMargin>
                  <Button onClick={close} $primary>
                    Cancel
                  </Button>
                  <Button disabled={deleteMediaStatus.isLoading} onClick={() => deleteMedia()}>
                    Delete
                  </Button>
                </ButtonRow>
              );
            }}
          >
            <Button>Delete image</Button>
          </ModalButton>
        </ButtonRow>
        {media.hashtags?.indexOf('iiif') !== -1 || iiif ? (
          <VaultProvider>
            <AtlasViewerImage media={media} />
          </VaultProvider>
        ) : null}
      </div>
    );
  },
  {
    getKey: params => {
      return ['admin-view-media', { mediaId: params.mediaId }];
    },
    getData: (key, vars, api) => {
      // return api.pageBlocks.getAllPages();
      return api.media.getMedia(vars.mediaId);
    },
  }
);
