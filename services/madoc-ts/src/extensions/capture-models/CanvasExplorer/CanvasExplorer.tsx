import { InternationalString } from '@iiif/presentation-3';
import React, { useRef } from 'react';
import { RoundedCard } from '../../../frontend/shared/capture-models/editor/components/RoundedCard/RoundedCard';
import { LocaleString, useCreateLocaleString } from '../../../frontend/shared/components/LocaleString';
import { useManifest } from '../../../frontend/site/hooks/use-manifest';
import { CroppedImage } from '../../../frontend/shared/atoms/Images';
import { useTranslation } from 'react-i18next';
import { ImageStripBox } from '../../../frontend/shared/atoms/ImageStrip';
import { ImageGrid } from '../../../frontend/shared/atoms/ImageGrid';
import { Heading5 } from '../../../frontend/shared/typography/Heading5';
import { CanvasSnippet } from '../../../frontend/shared/features/CanvasSnippet';

export type CanvasExplorerProps = {
  id: string;
  label: string;
  thumbnail?: string;
  type: string;
  value: {
    id: string;
    thumbnail?: string | null;
    label: InternationalString;
  } | null;
};

export const CanvasExplorer: React.FC<CanvasExplorerProps & {
  updateValue: (value: CanvasExplorerProps['value']) => void;
}> = props => {
  const { t } = useTranslation();
  const createLocaleString = useCreateLocaleString();
  const { data } = useManifest();
  const manifest = data?.manifest;
  const container = useRef<HTMLDivElement>(null);

  if (props.value) {
    return (
      <RoundedCard interactive size="small" onClick={() => props.updateValue(null)}>
        <CanvasSnippet id={Number(props.value.id)} manifestId={manifest?.id} />
      </RoundedCard>
    );
  }

  return (
    <div
      ref={container}
      style={{
        maxHeight: 350,
        overflowY: 'scroll',
        border: '2px solid #fefefe',
      }}
    >
      <ImageGrid $size="small">
        {manifest?.items.map(item => {
          return (
            <ImageStripBox
              onClick={() =>
                props.updateValue({ id: item.id.toString(), label: item.label, thumbnail: item.thumbnail })
              }
              key={item.id}
            >
              <CroppedImage>
                {item.thumbnail ? (
                  <img alt={createLocaleString(item.label, t('Canvas thumbnail'))} src={item.thumbnail} />
                ) : null}
                <LocaleString as={Heading5}>{item.label}</LocaleString>
              </CroppedImage>
            </ImageStripBox>
          );
        })}
      </ImageGrid>
    </div>
  );
};
