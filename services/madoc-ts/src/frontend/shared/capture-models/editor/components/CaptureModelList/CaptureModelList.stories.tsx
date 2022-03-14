import React from 'react';
import { Card, CardContent } from '../../atoms/Card';
import { CaptureModelList } from './CaptureModelList';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';

export default { title: 'Capture model editor components/Capture Model List' };

export const Simple: React.FC = () => {
  const models = [
    { label: 'Model A', id: '1' },
    { label: 'Model B', id: '2' },
  ];

  return (
    <ThemeProvider theme={defaultTheme}>
      <Card fluid style={{ margin: 40 }}>
        <CardContent>
          <CaptureModelList
            captureModels={models}
            onClick={e => console.log('onclick', e)}
            onDelete={e => console.log('remove', e)}
          />
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};
