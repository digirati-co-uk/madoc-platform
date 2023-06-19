import React from 'react';
import { useTranslation } from 'react-i18next';
import { SimpleCard } from '../atoms/SimpleCard';
import { Button } from '../navigation/Button';
import { RevisionRequest } from './types/revision-request';
import { ModelTranslation } from './utility/model-translation';

export const Choice: React.FC<{
  showBackButton: boolean;
  onBackButton: () => void;
  onChoice: (id: string) => void;
  choice: { items: any[] };
  revisions?: Record<string, RevisionRequest[]>;
}> = ({ choice, onChoice, showBackButton, onBackButton, revisions, children }) => {
  const { t } = useTranslation();

  return (
    <>
      {showBackButton ? (
        <div style={{ marginBottom: '1em', fontSize: '1rem' }}>
          <Button onClick={onBackButton}>{t('back')}</Button>
        </div>
      ) : null}
      {choice.items.map((item, idx) => (
        <SimpleCard
          key={idx}
          label={item.label ? <ModelTranslation>{item.label}</ModelTranslation> : undefined}
          interactive
          onClick={() => onChoice(item.id)}
        >
          <ModelTranslation>{item.description}</ModelTranslation>
          {revisions && revisions[item.id] && revisions[item.id].length ? (
            <div
              style={{
                color: '#5EA582',
                fontWeight: 600,
                marginTop: '.2em',
              }}
            >
              {t(`{{count}} submission`, { count: revisions[item.id].length })}
            </div>
          ) : null}
        </SimpleCard>
      ))}
      {children}
    </>
  );
};
