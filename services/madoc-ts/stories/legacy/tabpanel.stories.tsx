import * as React from 'react';
import { TabPanel } from '../../src/frontend/shared/components/TabPanel';

export default { title: 'Legacy/Tab Panel' };

export const Tab_Panel = () => {
  const [selected, setSelected] = React.useState(0);
  return (
    <TabPanel
      menu={[
        { label: 'TRANSCRIPTION', component: <div>I will be the transcription panel</div> },
        { label: 'METADATA', component: <div>I will be the metadata panel</div> },
      ]}
      switchPanel={(idx: number) => setSelected(idx)}
      selected={selected}
    />
  );
};
