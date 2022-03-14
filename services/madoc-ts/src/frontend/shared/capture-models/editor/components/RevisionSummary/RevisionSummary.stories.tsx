import React, { useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';
import { RevisionSummary } from './RevisionSummary';

export default { title: 'Legacy/ Revision Summary' };

export const SaveOption = () => {
  const [text, setText] = useState('');

  return (
    <div style={{ padding: 50, maxWidth: 500, margin: '0 auto' }}>
      <ThemeProvider theme={defaultTheme}>
        <RevisionSummary
          onSave={() => console.log('saved')}
          descriptionOfChange={text}
          setDescriptionOfChange={setText}
        />
      </ThemeProvider>
    </div>
  );
};

export const EditOption = () => {
  const [text, setText] = useState('');

  return (
    <div style={{ padding: 50, maxWidth: 500, margin: '0 auto' }}>
      <ThemeProvider theme={defaultTheme}>
        <RevisionSummary
          onEdit={() => console.log('saved')}
          descriptionOfChange={text}
          setDescriptionOfChange={setText}
        />
      </ThemeProvider>
    </div>
  );
};

export const SaveAndEditOption = () => {
  const [text, setText] = useState('');

  return (
    <div style={{ padding: 50, maxWidth: 500, margin: '0 auto' }}>
      <ThemeProvider theme={defaultTheme}>
        <RevisionSummary
          onSave={() => console.log('saved')}
          onEdit={() => console.log('edited')}
          descriptionOfChange={text}
          setDescriptionOfChange={setText}
        />
      </ThemeProvider>
    </div>
  );
};
