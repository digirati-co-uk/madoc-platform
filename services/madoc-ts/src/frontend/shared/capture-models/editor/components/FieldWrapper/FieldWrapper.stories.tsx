import React from 'react';
import { ThemeProvider } from 'styled-components';
import { PluginProvider } from '../../../plugin-api/context';
import { defaultTheme } from '../../themes';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { FieldWrapper } from './FieldWrapper';
// Import some plugins
import '../../input-types/TextField/index';
import '../../selector-types/BoxSelector';
import '../../content-types/Atlas';

export default { title: 'Legacy/Field Wrapper' };

export const Simple: React.FC = () => {
  return (
    <div style={{ padding: 100 }}>
      <ThemeProvider theme={defaultTheme}>
        <PluginProvider>
          <RoundedCard>
            <FieldWrapper
              field={{
                id: '1',
                type: 'text-field',
                value: 'value',
                description: 'Some description',
                label: 'Some label',
              }}
              showTerm={true}
              term="title"
              onUpdateValue={val => console.log(val)}
            />
            <FieldWrapper
              field={{
                id: '2',
                type: 'text-field',
                value: 'value 2',
                description: 'Some other longer description',
                label: 'Another field',
              }}
              chooseSelector={selector => {
                console.log('chose selector', selector);
              }}
              selector={{
                id: '123',
                type: 'box-selector',
                state: {
                  x: 0,
                  y: 0,
                  height: 100,
                  width: 100,
                },
              }}
              showTerm={true}
              term="description"
              onUpdateValue={val => console.log(val)}
            />
            <FieldWrapper
              field={{
                id: '3',
                type: 'text-field',
                value: 'value 3',
                description: 'Some other longer description',
                label: 'Another field',
              }}
              chooseSelector={selector => {
                console.log('chose selector', selector);
              }}
              selector={{
                id: '456',
                type: 'box-selector',
                state: null,
              }}
              showTerm={true}
              term="description"
              onUpdateValue={val => console.log(val)}
            />
          </RoundedCard>
        </PluginProvider>
      </ThemeProvider>
    </div>
  );
};
