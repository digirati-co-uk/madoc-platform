import * as React from 'react';
import { SnippetLarge } from '../src/frontend/shared/atoms/SnippetLarge';
import styled from 'styled-components';

export default { title: 'Snippets' };

const StorybookPaddedBox = styled.div`
  padding: 2em;
`;

export const landscapeSnippet = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7443/74438561.4.jpg"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippet = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        portrait
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7443/74438561.4.jpg"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};
export const landscapeSnippetLargeThumbnail = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7441/74411378.4.jpg"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippetLargeThumbnail = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        portrait
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7441/74411378.4.jpg"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};

export const landscapeSnippetNoThumbnail = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippetNoThumbnail = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        portrait
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};
