import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';

import { SubHeading, Divider, HeroHeading, Wrapper, Actions } from './custom-ida-hero.style';
import { TextButton } from '../../custom-components/Button/Button';
import { Share, Bookmark } from '@styled-icons/entypo';
import { useManifest } from '../../../site/hooks/use-manifest';
import { LocaleString } from '../../components/LocaleString';
import { useData } from '../../hooks/use-data';
import { ManifestLoader } from '../../../site/pages/loaders/manifest-loader';
import { CanvasLoader } from '../../../site/pages/loaders/canvas-loader';

export function CustomIdaHero(props: { subHeading?: string }) {
  const { data: manifestResponse } = useData(ManifestLoader);
  const { data: canvasResponse } = useData(CanvasLoader);

  const manifest = manifestResponse?.manifest;
  const canvas = canvasResponse?.canvas;

  if (!canvas?.id && !manifest?.id) {
    return <HeroHeading>...</HeroHeading>;
  }

  return (
    <Wrapper>
      <HeroHeading>
        {!canvas || !canvas.label ? (
          <LocaleString>{manifest?.label}</LocaleString>
        ) : (
          <LocaleString>{canvas?.label}</LocaleString>
        )}
      </HeroHeading>
      <Actions>
        <TextButton>
          <Bookmark /> Bookmark this
        </TextButton>
        <TextButton>
          <Share /> Share this page
        </TextButton>
      </Actions>
      <Divider />
      <SubHeading>{props.subHeading}</SubHeading>
    </Wrapper>
  );
}

blockEditorFor(CustomIdaHero, {
  type: 'custom-ida-hero',
  label: 'IDA Hero',
  defaultProps: {
    subHeading: 'World', // This will pre-populate the form
  },
  editor: {
    subHeading: { label: 'Enter a subheading', type: 'text-field' },
  },
});
