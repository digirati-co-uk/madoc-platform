import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { CardButton } from '../../editor/components/CardButton/CardButton';
import { CardButtonGroup } from '../../editor/components/CardButtonGroup/CardButtonGroup';
import { useModelTranslation } from '../../hooks/use-model-translation';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useFieldListNavigation } from '../hooks/use-field-list-navigation';

const NoOverflowCardButton = styled(CardButton)`
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  box-shadow: none;
`;

export const DefaultAdjacentNavigation: React.FC = ({ children }) => {
  const { t } = useTranslation();
  const { t: tModel } = useModelTranslation();
  const [entity] = useCurrentEntity();
  const { goPrev, goNext } = useFieldListNavigation();

  return (
    <>
      {goNext || goPrev ? (
        <CardButtonGroup>
          <NoOverflowCardButton size="small" onClick={goPrev} disabled={!goPrev}>
            {t('Prev {{label}}', { label: tModel(entity.label) })}
          </NoOverflowCardButton>
          <NoOverflowCardButton size="small" onClick={goNext} disabled={!goNext}>
            {t('Next {{label}}', { label: tModel(entity.label) })}
          </NoOverflowCardButton>
        </CardButtonGroup>
      ) : null}
      {children}
    </>
  );
};
