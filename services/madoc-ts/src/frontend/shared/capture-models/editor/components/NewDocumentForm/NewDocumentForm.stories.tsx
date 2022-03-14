import React from 'react';
import { NewDocumentForm } from './NewDocumentForm';

export default { title: 'Capture model editor components/New Document Form' };

export const Simple: React.FC = () => <NewDocumentForm existingTerms={[]} onSave={t => console.log(t)} />;
