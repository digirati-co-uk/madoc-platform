import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleCard } from '../atoms/SimpleCard';
import { Button } from '../navigation/Button';
import { useModelTranslation } from './hooks/use-model-translation';

export const Choice: React.FC<{
  showBackButton: boolean;
  onBackButton: () => void;
  onChoice: (id: string) => void;
  choice: { items: any[] };
}> = ({ choice, onChoice, showBackButton, onBackButton, children }) => {
  const { t } = useTranslation();
  const { t: tModel } = useModelTranslation();

  return (
    <>
      {showBackButton ? (
        <div style={{ marginBottom: '1em', fontSize: '1rem' }}>
          <Button onClick={onBackButton}>{t('back')}</Button>
        </div>
      ) : null}
      {choice.items.map((item, idx) => (
        <SimpleCard key={idx} label={tModel(item.label)} interactive onClick={() => onChoice(item.id)}>
          {tModel(item.description)}
        </SimpleCard>
      ))}
      {children}
    </>
  );
};
