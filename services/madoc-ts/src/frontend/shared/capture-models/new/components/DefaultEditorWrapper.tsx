import React from 'react';
import { Message } from '../../../atoms/Message';
import { useNavigation } from '../../editor/hooks/useNavigation';
import { useModelTranslation } from '../../hooks/use-model-translation';

export const DefaultEditorWrapper: React.FC = ({ children }) => {
  const [currentView] = useNavigation();
  const { t: tModel } = useModelTranslation();

  return (
    <div>
      {currentView && currentView.type === 'model' && currentView.instructions ? (
        <Message header="Instructions" id="crowdsourcing-instructions">
          {tModel(currentView.instructions)}
        </Message>
      ) : null}

      {children}
    </div>
  );
};
