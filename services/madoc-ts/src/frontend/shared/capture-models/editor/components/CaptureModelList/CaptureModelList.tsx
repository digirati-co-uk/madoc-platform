import { RoundedCard } from '../RoundedCard/RoundedCard';
import React, { useMemo } from 'react';
import { Heading } from '../Heading/Heading';
import { useTranslation } from 'react-i18next';

type Props = {
  captureModels: Array<{ id: string; label: string }>;
  onDelete: (model: string) => void;
  onClick: (model: string) => void;
};

export const CaptureModelList: React.FC<Props> = ({ captureModels, onClick, onDelete }) => {
  const { t } = useTranslation();
  const orderedList = useMemo(() => {
    return captureModels.sort((a, b) => {
      return (a.label || t('Untitled')).localeCompare(b.label || t('Untitled'));
    });
  }, [t, captureModels]);

  return (
    <>
      <div style={{ maxWidth: 400 }}>
        {orderedList.map(model => (
          <RoundedCard key={model.id} interactive onClick={() => onClick(model.id)}>
            <Heading size="small">{model.label}</Heading>
          </RoundedCard>
        ))}
      </div>
    </>
  );
};
