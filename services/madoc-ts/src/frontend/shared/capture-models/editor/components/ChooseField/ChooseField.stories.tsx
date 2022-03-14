import * as React from 'react';
import { PluginProvider } from '../../../plugin-api/context';
import { ChooseField } from './ChooseField';
// Import some fields.
import '../../input-types/TextField/index';
import '../../input-types/HTMLField';

export default { title: 'Capture model editor components/Choose field' };

export const Simple: React.FC = () => {
  return (
    <PluginProvider>
      <ChooseField handleChoice={choice => console.log(choice)} />
    </PluginProvider>
  );
};
