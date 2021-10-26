import { boolean, select } from '@storybook/addon-knobs';
import * as React from 'react';
import { SnippetLarge } from '../../src/frontend/shared/atoms/SnippetLarge';
import styled from 'styled-components';

export default { title: 'Legacy/Snippets' };

const StorybookPaddedBox = styled.div`
  padding: 2em;
`;

export const landscapeSnippet = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const stackedThumbnail = boolean('Stacked thumbnail', true);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7443/74438561.4.jpg"
        stackedThumbnail={stackedThumbnail}
        buttonText="view manifest"
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippet = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

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
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const interactiveSnippet = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', true);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <a href="#" style={{ textDecoration: 'none' }}>
        <SnippetLarge
          portrait
          label="Manifest name"
          subtitle="Manifest with 26 items"
          summary="Summary of manifest if there is one"
          link="#"
          thumbnail="https://deriv.nls.uk/dcn4/7443/74438561.4.jpg"
          buttonText="view manifest"
          lightBackground={lightBackground}
          flat={flat}
          size={size}
          center={center}
          buttonRole={buttonRole}
          interactive
        />
      </a>
    </StorybookPaddedBox>
  );
};

export const landscapeSnippetLargeThumbnail = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const stackedThumbnail = boolean('Stacked thumbnail', true);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        thumbnail="https://deriv.nls.uk/dcn4/7441/74411378.4.jpg"
        buttonText="view manifest"
        lightBackground={lightBackground}
        stackedThumbnail={stackedThumbnail}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippetLargeThumbnail = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

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
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const landscapeSnippetNoThumbnail = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        buttonText="view manifest"
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippetNoThumbnail = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <SnippetLarge
        portrait
        label="Manifest name"
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        link="#"
        buttonText="view manifest"
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const portraitSnippetLong = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');
  const stackedThumbnail = boolean('Stacked thumbnail', true);

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
        stackedThumbnail={stackedThumbnail}
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};

export const landscapeSnippetLong = () => {
  const lightBackground = boolean('Light background', false);
  const flat = boolean('Flat container', false);
  const size = select('Size', ['sm', 'md', 'lg'], 'sm');
  const center = boolean('Center', false);
  const buttonRole = select('Button role', ['button', 'link'], 'button');

  return (
    <StorybookPaddedBox>
      <SnippetLarge
        label="Hospital Saturday Fund : [fold-out presentation album of T. Stevens and W.H. Grant's 14 street collection flags from between 1886 to 1897 with a 1996 congratulatory telegram from Mr. and Mrs. Eusden and their business card]."
        subtitle="Manifest with 26 items"
        summary="Summary of manifest if there is one"
        thumbnail="https://dlcs.io/thumbs/wellcome/5/B28636491_0001.JP2/full/200,80/0/default.jpg"
        link="#"
        buttonText="view manifest"
        lightBackground={lightBackground}
        flat={flat}
        size={size}
        center={center}
        buttonRole={buttonRole}
      />
    </StorybookPaddedBox>
  );
};
