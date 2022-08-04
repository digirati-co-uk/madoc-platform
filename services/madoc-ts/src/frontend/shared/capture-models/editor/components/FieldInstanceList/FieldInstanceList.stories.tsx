import React from 'react';
import { defaultTheme } from '../../themes';
import { FieldInstanceList } from './FieldInstanceList';
import { ThemeProvider } from 'styled-components';

import simple from '../../../../../../../fixtures/01-basic/05-multiple-fields-multiple-values.json';

export default { title: 'Legacy/Field instance list' };
export const SimpleExample: React.FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <div style={{ padding: '100px' }}>
        <FieldInstanceList
          chooseField={field => console.log('choose field', field)}
          fields={simple.document.properties.name}
          property={'name'}
        />
      </div>
    </ThemeProvider>
  );
};
