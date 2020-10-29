import React from 'react';
import { AdminHeader as OriginalAdminHeader } from '../../../frontend/admin/molecules/AdminHeader';

export type Props = {
  // Add props in here.
  title: string;
  /**
   * @uxpinpropname Breadcrumbs
   * @uxpincontroltype textfield(3)
   */
  breadcrumbs: string;
  /**
   * @uxpinpropname Menu
   * @uxpincontroltype textfield(3)
   */
  menu: string;

  /**
   * @uxpinpropname Active Menu Item
   */
  activeItem?: string;
};

/**
 * @uxpincomponent
 */
function AdminHeader(props: Props) {
  return (
    <OriginalAdminHeader
      title={props.title || 'Untitled header'}
      breadcrumbs={(props.breadcrumbs || '').split('\n').map((title, n) => ({
        label: title,
        link: '#',
        active: n === props.breadcrumbs.length - 1,
      }))}
      menu={(props.menu || '').split('\n').map((title, n) => ({
        label: title,
        link: '#',
        active: title.trim() === props.activeItem?.trim(),
      }))}
    />
  );
}

export default AdminHeader;
