import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';

import { SubHeading, Divider, HeroHeading, Wrapper, Actions } from './custom-ida-hero.style';
import { TextButton } from '../../custom-components/Button/Button';
import { Share, Bookmark } from '@styled-icons/entypo';

export function CustomIdaHero(props: { heading: string; subHeading?: string }) {
  return (
    <Wrapper>
      <HeroHeading>{props.heading}</HeroHeading>
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
    heading: 'hello', // This will pre-populate the form
    subHeading: 'World', // This will pre-populate the form
  },
  editor: {
    heading: { label: 'Enter a heading', type: 'text-field' },
    subHeading: { label: 'Enter a subheading', type: 'text-field' },
  },
});
