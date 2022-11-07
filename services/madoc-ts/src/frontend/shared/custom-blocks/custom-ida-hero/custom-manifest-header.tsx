import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';

import { HeroText, Divider, HeroHeading, Wrapper, Actions } from './custom-ida-hero.style';
import { TextButton } from '../../custom-components/Button/Button';
import { Share, Bookmark } from '@styled-icons/entypo';
import { LocaleString } from '../../components/LocaleString';
import { useData } from '../../hooks/use-data';
import { ManifestLoader } from '../../../site/pages/loaders/manifest-loader';

export function CustomManifestHeader(props: { subHeading?: string }) {
  const { data: manifestResponse } = useData(ManifestLoader);
  const manifest = manifestResponse?.manifest;

  if (!manifest?.id) {
    return <HeroHeading>...</HeroHeading>;
  }

  return (
    <Wrapper>
      <HeroHeading>
        <LocaleString>{manifest?.label}</LocaleString>
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

blockEditorFor(CustomManifestHeader, {
  type: 'custom-manifest-header',
  label: 'IDA manifest header',
  anyContext: ['manifest'],
  requiredContext: ['manifest'],
  defaultProps: {
    subHeading: '', // This will pre-populate the form
  },
  editor: {
    subHeading: { label: 'Enter a subheading', type: 'text-field' },
  },
});
