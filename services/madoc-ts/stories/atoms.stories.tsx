import * as React from 'react';
import { Button, SmallButton } from '../src/frontend/shared/atoms/Button';
import { Breadcrumbs } from '../src/frontend/shared/atoms/Breadcrumbs';
import { MemoryRouter } from 'react-router-dom';

export default { title: 'Atoms' };

export const buttons = () => (
  <div>
    <Button>Button</Button>
    <br />
    <br />
    <SmallButton>Small button</SmallButton>

    <p>testing this works.</p>
  </div>
);

export const breadcrumbs = () => (
  <MemoryRouter>
    <Breadcrumbs
      items={[
        { label: 'site dashboard', link: '#' },
        { label: 'projects', link: '#' },
        { label: 'My project', link: '#', active: true },
      ]}
    />
  </MemoryRouter>
);
