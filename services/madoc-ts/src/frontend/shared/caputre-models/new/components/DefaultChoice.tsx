import { useNavigation } from '@capture-models/editor';
import React from 'react';
import { Choice } from '../../Choice';

export const DefaultChoice: React.FC = () => {
  const [currentView, { pop, push, idStack }] = useNavigation();

  if (!currentView) {
    return null;
  }

  if (currentView.type === 'model') {
    return null;
  }

  return <Choice choice={currentView} onBackButton={() => pop()} onChoice={push} showBackButton={idStack.length > 0} />;
};
