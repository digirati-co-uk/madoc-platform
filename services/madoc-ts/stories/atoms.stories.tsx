import * as React from 'react';
import { Button, SmallButton, TinyButton } from '../src/frontend/admin/atoms/Button';
import { Breadcrumbs } from '../src/frontend/admin/atoms/Breadcrumbs';
import { MemoryRouter } from 'react-router-dom';

export default { title: 'Atoms' };

export const buttons = () => (
  <div>
    <Button>Button</Button>
    <br />
    <br />
    <SmallButton>Small button</SmallButton>
    <br />
    <br />
    <TinyButton>Tiny button</TinyButton>

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
