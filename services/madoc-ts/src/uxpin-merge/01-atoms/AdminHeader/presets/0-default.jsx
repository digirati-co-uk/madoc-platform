import React from 'react';
import AdminHeader from '../AdminHeader';

export default (
  <AdminHeader
    uxpId="AdminHeader-1"
    title="My awesome project"
    breadcrumbs={`site dashboard
projects
My project`}
    menu={
`Overview
Basic details
Capture model
Content
Access control
Export`
    }
  />
);
