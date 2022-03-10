import React from 'react';
import { ChooseSelectorButton } from './ChooseSelectorButton';

export default { title: 'Capture model editor components/Choose Selector Button' };

export const Simple: React.FC = () => <ChooseSelectorButton value="box-selector" onChange={t => console.log(t)} />;
