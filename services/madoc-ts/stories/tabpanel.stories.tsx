import React, {useState} from 'react';
import { TabPanel } from '../src/frontend/shared/components/TabPanel';

export default { title: 'Tab Panel' };

export const tabPanel = () => {
  const [selected, setSelected] = useState(0);
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
  }


