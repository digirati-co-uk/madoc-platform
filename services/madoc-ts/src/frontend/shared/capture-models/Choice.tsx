import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleCard } from '../atoms/SimpleCard';
import { Button } from '../navigation/Button';

export const Choice: React.FC<{
  showBackButton: boolean;
  onBackButton: () => void;
  onChoice: (id: string) => void;
  choice: { items: any[] };
}> = ({ choice, onChoice, showBackButton, onBackButton, children }) => {
  const { t } = useTranslation();
  return (
    <>
      {showBackButton ? (
        <div style={{ marginBottom: '1em', fontSize: '1rem' }}>
          <Button onClick={onBackButton}>{t('back')}</Button>
        </div>
      ) : null}
      {choice.items.map((item, idx) => (
        <SimpleCard key={idx} label={item.label} interactive onClick={() => onChoice(item.id)}>
          {item.description}
        </SimpleCard>
      ))}
      {children}
    </>
  );
};
