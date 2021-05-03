import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { DefaultHomepage } from '../features/DefaultHomepage';
import { StaticPage } from '../features/StaticPage';

export const Homepage = () => {
  return (
    <StaticPage title="Homepage">
      <Slot name="homepage-header" />
      <Slot name="homepage-main">
        <DefaultHomepage />
      </Slot>
      <Slot name="homepage-footer" />
    </StaticPage>
  );
};
