import React from 'react';
import { Message } from '../../../atoms/Message';
import { useNavigation } from '../../editor/hooks/useNavigation';

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
