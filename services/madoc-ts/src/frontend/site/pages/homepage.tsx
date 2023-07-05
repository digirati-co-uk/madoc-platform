import React from 'react';
import { Slot } from '../../shared/page-blocks/slot';
import { DefaultHomepage } from '../blocks/DefaultHomepage';
import { StaticPage } from '../features/viewPage/StaticPage';

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
