import React from 'react';
import AdminHeader from '../AdminHeader';

export default (
  <AdminHeader
    title="My awesome project"
    breadcrumbs={`site dashboard\nprojects\nMy project`}
    menu={`Overview\nBasic details\nCapture model\nContent\nAccess control\nExport`}
    activeItem={'Overview'}
  />
);
