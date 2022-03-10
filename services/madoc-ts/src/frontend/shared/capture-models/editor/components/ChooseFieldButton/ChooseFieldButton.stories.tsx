import React from 'react';
import { ChooseFieldButton } from './ChooseFieldButton';
import { Card, CardContent } from '../../atoms/Card';

export default { title: 'Capture model editor components/Choose Field Button' };

export const Simple: React.FC = () => (
  <Card fluid>
    <CardContent style={{ padding: 40 }}>
      <ChooseFieldButton onChange={t => console.log(t)} />
    </CardContent>
  </Card>
);
