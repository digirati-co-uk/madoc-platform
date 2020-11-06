import * as React from 'react';
import { Button, SmallButton } from '../src/frontend/shared/atoms/Button';
import { Breadcrumbs } from '../src/frontend/shared/atoms/Breadcrumbs';
import { MemoryRouter } from 'react-router-dom';
import { SearchBox } from '../src/frontend/shared/atoms/SearchBox';
import { Dropdown } from '@capture-models/editor';
import { StandardButton } from '../src/frontend/shared/atoms/StandardButton';
import { StorybookPaddedBox } from './utils';

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

export const searchBox = () => <SearchBox large={true} onSearch={val => alert('you searched for ' + val)} />;

const options = [
  { value: 'Option1', text: 'Option 1' },
  { value: 'Option2', text: 'Option 2' },
  { value: 'Option3', text: 'Option 3' },
];
export const dropDown = () => <Dropdown options={options} onChange={val => console.log(val)} placeholder="Select" />;

export const StandardButtons: React.FC = () => {
  const spacer = (
    <>
      <br />
      <br />
    </>
  );
  return (
    <StorybookPaddedBox>
      <h3>Primary</h3>
      <StandardButton $variation="primary" $size="large">
        Primary Large
      </StandardButton>
      {spacer}
      <StandardButton $variation="primary" $size="medium">
        Primary Medium
      </StandardButton>
      {spacer}
      <StandardButton $variation="primary" $size="small">
        Primary Small
      </StandardButton>
      <hr />
      <h3>Secondary</h3>
      <StandardButton $variation="secondary" $size="large">
        Secondary Large
      </StandardButton>
      {spacer}
      <StandardButton $variation="secondary" $size="medium">
        Secondary Medium
      </StandardButton>
      {spacer}
      <StandardButton $variation="secondary" $size="small">
        Secondary Small
      </StandardButton>
      <hr />
      <h3>Tertiary</h3>
      <StandardButton $variation="tertiary" $size="large">
        Tertiary Large
      </StandardButton>
      {spacer}
      <StandardButton $variation="tertiary" $size="medium">
        Tertiary Medium
      </StandardButton>
      {spacer}
      <StandardButton $variation="tertiary" $size="small">
        Tertiary Small
      </StandardButton>
    </StorybookPaddedBox>
  );
};
