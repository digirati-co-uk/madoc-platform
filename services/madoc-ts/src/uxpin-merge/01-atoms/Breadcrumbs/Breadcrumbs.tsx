import React from 'react';
import { Breadcrumbs as OriginalBreadcrumbs } from '../../../frontend/shared/atoms/Breadcrumbs';

export type Props = {
  /**
   * @uxpincontroltype textfield(3)
   */
  items: string;
  activeItem: string;
  type?: 'site';
  background?: string;
  color?: string;
  $activeColor?: string;
  padding?: string;
};

/**
 * @uxpincomponent
 */
function Breadcrumbs({ activeItem, items, ...props }: Props) {
  return (
    <OriginalBreadcrumbs
      items={items.split('\n').map((item, i) => ({ link: `#${i}`, label: item, active: activeItem === item }))}
      {...props}
    />
  );
}

export default Breadcrumbs;
