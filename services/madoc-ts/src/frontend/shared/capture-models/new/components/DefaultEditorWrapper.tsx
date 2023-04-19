import React from 'react';
import { Message } from '../../../atoms/Message';
import { useNavigation } from '../../editor/hooks/useNavigation';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { useTranslation } from 'react-i18next';

export const DefaultEditorWrapper: React.FC = ({ children }) => {
  const [currentView] = useNavigation();
  const { t: tModel } = useModelTranslation();
  const { t } = useTranslation();

  return (
    <div>
      {currentView && currentView.type === 'model' && currentView.instructions ? (
        <Message header={t('Instructions')} id="crowdsourcing-instructions">
          {tModel(currentView.instructions)}
        </Message>
      ) : null}

      {children}
    </div>
  );
};
