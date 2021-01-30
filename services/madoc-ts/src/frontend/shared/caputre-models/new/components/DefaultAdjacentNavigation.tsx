import { CardButton, CardButtonGroup } from '@capture-models/editor';
import React from 'react';
import { useCurrentEntity } from '../hooks/use-current-entity';
import { useFieldListNavigation } from '../hooks/use-field-list-navigation';

export const DefaultAdjacentNavigation: React.FC = ({ children }) => {
  const [entity] = useCurrentEntity();
  const { goPrev, goNext } = useFieldListNavigation();

  return (
    <>
      {goNext || goPrev ? (
        <CardButtonGroup>
          <CardButton size="small" onClick={goPrev} disabled={!goPrev}>
            Previous {entity.label}
          </CardButton>
          <CardButton size="small" onClick={goNext} disabled={!goNext}>
            Next {entity.label}
          </CardButton>
        </CardButtonGroup>
      ) : null}
      {children}
    </>
  );
};
