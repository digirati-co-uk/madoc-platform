import * as React from 'react';
import { BreadcrumbDivider, BreadcrumbItem, BreadcrumbList } from '../../src/frontend/shared/components/Breadcrumbs';

export default { title: 'Legacy/Breadcrumbs' };

export const defaultList = () => {
  return (
    <BreadcrumbList>
      <BreadcrumbItem>Test 1</BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>Test 2</BreadcrumbItem>
    </BreadcrumbList>
  );
};
