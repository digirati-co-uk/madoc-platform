import React, { useEffect, useState } from 'react';
import { CanvasNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { useVaultEffect } from '@hyperion-framework/react-vault';
import { Heading3 } from '../../shared/atoms/Heading3';
import { LocaleString } from '../../shared/components/LocaleString';
import { ImageGrid, ImageGridItem } from '../../shared/atoms/ImageGrid';
import { CroppedImage } from '../../shared/atoms/Images';
import { SingleLineHeading5 } from '../../shared/atoms/Heading5';
import { SmallButton } from '../../shared/atoms/Button';
import { useTranslation } from 'react-i18next';

const CanvasThumbnail: React.FC<{ canvas: CanvasNormalized; height: number }> = ({ canvas, height }) => {
  const [thumbnail, setThumbnail] = useState<string | undefined>();

  useVaultEffect(vault => {
    vault.getThumbnail(canvas, {}, true).then(t => {
      if (t.best) {
        setThumbnail(t.best.id);
      }
    });
  });

  if (!thumbnail) {
    return <>loading...</>;
  }

  return <img alt="thumbnail" src={thumbnail} />;
};

export const PreviewManifest: React.FC<{ id: string; onClick?: (id: string) => void }> = props => {
  const { t } = useTranslation();
  const [manifest, setManifest] = useState<ManifestNormalized | undefined>();
  const [allCanvases, setCanvases] = useState<CanvasNormalized[] | undefined>();

  const [page, setPage] = useState(0);
  const pages = allCanvases ? Math.ceil(allCanvases.length / 24) : 0;
  const canvases = allCanvases ? allCanvases.slice(page * 24, page * 24 + 24) : [];

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
    <div>
      <Heading3>
        <LocaleString>{manifest.label || { none: ['Untitled manifest'] }}</LocaleString>
      </Heading3>
      <ImageGrid>
        {canvases
          ? canvases.map(canvas => {
              return (
                <ImageGridItem
                  $size="small"
                  $static={!props.onClick}
                  key={canvas.id}
                  onClick={() => {
                    if (props.onClick) {
                      props.onClick(canvas.id);
                    }
                  }}
                >
                  <CroppedImage $size="small">
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
      <div style={{ margin: '1em 0' }}>
        {page !== 0 ? <SmallButton onClick={() => setPage(page - 1)}>{t('Previous page')}</SmallButton> : null}
        <div style={{ display: 'inline-block', margin: 10, fontSize: '0.9em' }}>
          Page {page + 1} of {pages}
        </div>
        {page + 1 !== pages ? <SmallButton onClick={() => setPage(page + 1)}>{t('Next page')}</SmallButton> : null}
      </div>
    </div>
  );
};
