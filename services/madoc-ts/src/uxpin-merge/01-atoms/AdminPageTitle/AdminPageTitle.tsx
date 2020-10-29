import React from 'react';
import { AdminPageTitle as OriginalAdminPageTitle } from '../../../frontend/shared/atoms/AdminPageTitle';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function AdminPageTitle(props: Props) {
  return <OriginalAdminPageTitle {...props} />;
}

export default AdminPageTitle;