// Canonical pagination.

import * as React from 'react';
import { MemoryRouter } from 'react-router-dom';
import * as MoleculesPagination from '../src/frontend/admin/molecules/Pagination';
import { NavigationButton, PaginationContainer } from '../src/frontend/shared/components/CanvasNavigationMinimalist';
import { PaginationNumbered } from '../src/frontend/shared/components/Pagination';
import * as SharedPagination from '../src/frontend/shared/components/Pagination';

export default { title: 'Pagination variations' };

export const Molecules_Pagination = () => {
  return (
    <MemoryRouter>
      <MoleculesPagination.Pagination page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Shared_Pagination = () => {
  return (
    <MemoryRouter>
      <SharedPagination.Pagination page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Numbered_Pagination = () => {
  return (
    <MemoryRouter>
      <PaginationNumbered page={2} totalPages={10} stale={false} />
    </MemoryRouter>
  );
};

export const Canvas_Navigation = () => {
  const idx = 2;
  const totalPages = 10;

  return (
    <MemoryRouter>
      <PaginationContainer style={{ display: 'flex' }}>
        {idx > 0 ? <NavigationButton alignment="left" link="#" item={true as any} /> : null}
        {<p>{`${idx + 1} of ${idx + 1}`}</p>}
        {idx < totalPages ? <NavigationButton alignment="right" link="#" item={true as any} /> : null}
      </PaginationContainer>
    </MemoryRouter>
  );
};
