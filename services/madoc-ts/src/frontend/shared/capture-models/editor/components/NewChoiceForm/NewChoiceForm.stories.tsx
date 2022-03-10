import React from 'react';
import { NewChoiceForm } from './NewChoiceForm';

export default { title: 'Capture model editor components/New Choice Form' };

export const Simple: React.FC = () => <NewChoiceForm onSave={choice => console.log(choice)} />;
