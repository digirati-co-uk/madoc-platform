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

export const portraitSnippetLong = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        portrait
        label="Hospital Saturday Fund : [fold-out presentation album of T. Stevens and W.H. Grant's 14 street collection flags from between 1886 to 1897 with a 1996 congratulatory telegram from Mr. and Mrs. Eusden and their business card]."
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        thumbnail="https://dlcs.io/thumbs/wellcome/5/B28636491_0001.JP2/full/200,80/0/default.jpg"
        link="#"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};

export const landscapeSnippetLong = () => {
  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Hospital Saturday Fund : [fold-out presentation album of T. Stevens and W.H. Grant's 14 street collection flags from between 1886 to 1897 with a 1996 congratulatory telegram from Mr. and Mrs. Eusden and their business card]."
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        thumbnail="https://dlcs.io/thumbs/wellcome/5/B28636491_0001.JP2/full/200,80/0/default.jpg"
        link="#"
        buttonText="view manifest"
      />
    </StorybookPaddedBox>
  );
};
