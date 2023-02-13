import * as React from 'react';
import { SnippetLarge } from '../../src/frontend/shared/atoms/SnippetLarge';
import styled from 'styled-components';

export default { title: 'Legacy/Snippets' };

const StorybookPaddedBox = styled.div`
  padding: 2em;
`;

export const LandscapeSnippet = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const stackedThumbnail = true;
  const buttonRole = 'button';

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

export const PortraitSnippet = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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

export const InteractiveSnippet = () => {
  const lightBackground = false;
  const flat = true;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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

export const LandscapeSnippetLargeThumbnail = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const stackedThumbnail = true;
  const buttonRole = 'button';

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

export const PortraitSnippetLargeThumbnail = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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

export const LandscapeSnippetNoThumbnail = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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

export const PortraitSnippetNoThumbnail = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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

export const PortraitSnippetLong = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';
  const stackedThumbnail = true;

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

export const LandscapeSnippetLong = () => {
  const lightBackground = false;
  const flat = false;
  const size = 'sm';
  const center = false;
  const buttonRole = 'button';

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
