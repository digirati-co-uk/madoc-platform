import * as React from 'react';
import { PluginProvider } from '../../../plugin-api/context';
import { ChooseSelector } from './ChooseSelector';
// Import some fields.
import '../../selector-types/BoxSelector/index';

export default { title: 'Capture model editor components/Choose selector' };

export const Simple: React.FC = () => {
  return (
    <PluginProvider>
      <ChooseSelector handleChoice={choice => console.log(choice)} />
    </PluginProvider>
  );
};
