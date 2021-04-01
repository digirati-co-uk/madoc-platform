import { useNavigation } from '@capture-models/editor';
import React from 'react';
import { Message } from '../../../atoms/Message';

export const DefaultEditorWrapper: React.FC = ({ children }) => {
  const [currentView] = useNavigation();
  return (
    <div>
      {currentView && currentView.type === 'model' && currentView.instructions ? (
        <Message header="Instructions" id="crowdsourcing-instructions">
          {currentView.instructions}
        </Message>
      ) : null}

      {children}
    </div>
  );
};
