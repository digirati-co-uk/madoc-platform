// Canonical pagination.

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as MoleculesPagination from '../../src/frontend/admin/molecules/Pagination';
import { NavigationButton, PaginationContainer } from '../../src/frontend/shared/components/CanvasNavigationMinimalist';
import { PaginationNumbered } from '../../src/frontend/shared/components/Pagination';
import * as SharedPagination from '../../src/frontend/shared/components/Pagination';

export default { title: 'Legacy/Pagination variations' };

export const Molecules_Pagination = () => {
  return (
    <>
      <MoleculesPagination.Pagination page={2} totalPages={10} stale={false} />
    </>
  );
};

export const Shared_Pagination = () => {
  return (
    <>
      <SharedPagination.Pagination page={2} totalPages={10} stale={false} />
    </>
  );
};

export const Numbered_Pagination = () => {
  return (
    <>
      <PaginationNumbered page={2} totalPages={10} stale={false} />
    </>
  );
};

export const Canvas_Navigation = () => {
  const idx = 2;
  const totalPages = 10;

  return (
    <>
      <PaginationContainer style={{ display: 'flex' }}>
        {idx > 0 ? <NavigationButton alignment="left" link="#" item={true as any} /> : null}
        {<p>{`${idx + 1} of ${idx + 1}`}</p>}
        {idx < totalPages ? <NavigationButton alignment="right" link="#" item={true as any} /> : null}
      </PaginationContainer>
    </>
  );
};
