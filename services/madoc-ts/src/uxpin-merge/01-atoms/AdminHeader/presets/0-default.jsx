import React from 'react';
import AdminHeader from '../AdminHeader';

export default (
  <AdminHeader
    title="My awesome project"
    breadcrumbs={`site dashboard
projects
My project`}
    menu={`Overview
Basic details
Capture model
Content
Access control
Export`}
    activeItem={'Overview'}
  ></AdminHeader>
);
