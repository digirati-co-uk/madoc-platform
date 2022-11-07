import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';

import { HeroText, Divider, HeroHeading, Wrapper, Actions } from './custom-ida-hero.style';
import { TextButton } from '../../custom-components/Button/Button';
import { Share, Bookmark } from '@styled-icons/entypo';
import { LocaleString } from '../../components/LocaleString';
import { useData } from '../../hooks/use-data';
import { CanvasLoader } from '../../../site/pages/loaders/canvas-loader';

export function CustomCanvasHeader(props: { subHeading?: string }) {
  const { data: canvasResponse } = useData(CanvasLoader);
  const canvas = canvasResponse?.canvas;

  if (!canvas?.id) {
    return <HeroHeading>...</HeroHeading>;
  }

  return (
    <Wrapper>
      <HeroHeading>
        <LocaleString>{canvas?.label}</LocaleString>
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
      <HeroText>{props.subHeading}</HeroText>
    </Wrapper>
  );
}

blockEditorFor(CustomCanvasHeader, {
  type: 'custom-canvas-hero',
  label: 'IDA Canvas header',
  anyContext: ['canvas'],
  requiredContext: ['canvas'],
  defaultProps: {
    subHeading: '', // This will pre-populate the form
  },
  editor: {
    subHeading: { label: 'Enter a subheading', type: 'text-field' },
  },
});
