import React, { useEffect, useState } from 'react';
import { CanvasNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { useVaultEffect } from '@hyperion-framework/react-vault';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LocaleString } from '../../shared/components/LocaleString';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5 } from '../../shared/atoms/Heading5';
import { TinyButton } from '../../shared/atoms/Button';

const CanvasThumbnail: React.FC<{ canvas: CanvasNormalized; height: number }> = ({ canvas, height }) => {
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useVaultEffect(vault => {
    vault
      .getThumbnail(
        canvas,
        {
          maxWidth: 257,
          maxHeight: 257,
          unsafeImageService: false,
        },
        true
      )
      .then(t => {
        if (t.best) {
          setThumbnail(t.best.id);
        }
      });
  });

  if (!thumbnail) {
    return <>loading...</>;
  }

  return <img src={thumbnail} />;
};

export const PreviewManifest: React.FC<{ id: string }> = props => {
  const [manifest, setManifest] = useState<ManifestNormalized | undefined>();
  const [allCanvases, setCanvases] = useState<CanvasNormalized[] | undefined>();

  const [page, setPage] = useState(0);
  const pages = allCanvases ? Math.ceil(allCanvases.length / 32) : 0;
  const canvases = allCanvases ? allCanvases.slice(page * 32, page * 32 + 32) : [];

  useEffect(() => {
    setPage(0);
  }, [props.id]);

  useVaultEffect(
    vault => {
      vault.loadManifest(props.id).then(man => {
        setManifest(man);
        if (man) {
          setCanvases(
            man.items.map(can => {
              return vault.fromRef(can);
            })
          );
        }
      });
    },
    [props.id]
  );

  if (!manifest) {
    return <div>loading...</div>;
  }

  return (
    <div style={{ padding: '1em' }}>
      <Heading3>
        <LocaleString>{manifest.label || { none: ['Untitled manifest'] }}</LocaleString>
      </Heading3>
      {page !== 0 ? <TinyButton onClick={() => setPage(page - 1)}>Previous page</TinyButton> : null} |{' '}
      {page + 1 !== pages ? <TinyButton onClick={() => setPage(page + 1)}>Next page</TinyButton> : null}
      <ImageGrid>
        {canvases
          ? canvases.map(canvas => {
              return (
                <ImageGridItem key={canvas.id}>
                  <CroppedImage>
                    <CanvasThumbnail canvas={canvas} height={50} />
                  </CroppedImage>
                  <SingleLineHeading5>
                    <LocaleString>{canvas.label || { none: ['Untitled canvas'] }}</LocaleString>
                  </SingleLineHeading5>
                </ImageGridItem>
              );
            })
          : null}
      </ImageGrid>
    </div>
  );
};
