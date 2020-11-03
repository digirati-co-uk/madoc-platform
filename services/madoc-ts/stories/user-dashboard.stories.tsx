import { boolean } from '@storybook/addon-knobs';
import { useState } from 'react';
import * as React from 'react';
import { Heading1 } from '../src/frontend/shared/atoms/Heading1';
import { Heading3 } from '../src/frontend/shared/atoms/Heading3';
import { DashboardTabs, DashboardTab } from '../src/frontend/shared/components/DashboardTabs';
import { StorybookPaddedBox } from './utils';

export default { title: 'User dashboard' };

export const NormalUser: React.FC = () => {
  const isLoading = boolean('Set loading state', false);
  const [isTempLoading, setTempLoading] = useState(false);
  const [selected, setSelected] = useState(0);
  const menu = ['Overview', 'Contributions', 'Reviews', 'All tasks'];

  return (
    <StorybookPaddedBox>
      <Heading1 $margin>Site name</Heading1>
      <Heading3 $margin>Welcome back Ville</Heading3>
      <DashboardTabs $loading={isLoading || isTempLoading}>
        {menu.map((item, k) => {
          return (
            <DashboardTab
              key={k}
              $active={k === selected}
              onClick={() => {
                setTempLoading(true);
                setTimeout(() => {
                  setTempLoading(false);
                }, Math.random() * 2000);
                setSelected(k);
              }}
            >
              <a>{item}</a>
            </DashboardTab>
          );
        })}
      </DashboardTabs>
      <p>{isTempLoading ? 'loading...' : <div>Some content in the tabs {selected}</div>}</p>
    </StorybookPaddedBox>
  );
};
