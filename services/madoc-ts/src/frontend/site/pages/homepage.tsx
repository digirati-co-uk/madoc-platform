import React from 'react';
import { AvailableBlocks } from '../../shared/page-blocks/available-blocks';
import { Slot } from '../../shared/page-blocks/slot';
import { HeroCentered } from '../../tailwind/blocks/HeroCentered';
import { HeroHyper } from '../../tailwind/blocks/HeroHyper';
import { DefaultHomepage } from '../blocks/DefaultHomepage';
import { StaticPage } from '../features/viewPage/StaticPage';

export const Homepage = () => {
  return (
    <StaticPage title="Homepage">
      <Slot name="homepage-header" />
      <Slot name="homepage-main">
        <DefaultHomepage />
        <AvailableBlocks>
          <HeroCentered title="" image={null} description="" />
          <HeroHyper title="" image={null} description="" />
        </AvailableBlocks>
      </Slot>
      <Slot name="homepage-footer" />
    </StaticPage>
  );
};
