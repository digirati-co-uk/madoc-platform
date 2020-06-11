import { StructureType } from '@capture-models/types';
import React from 'react';

export const TabNavigation: React.FC<{
  currentId: string;
  onChoice: (id: string) => void;
  choice: StructureType<'choice'>;
}> = ({ choice, onChoice, currentId }) => {
  React.useEffect(() => {
    onChoice(choice.items[0].id);
  }, [choice.items, onChoice]);

  return (
    <div style={{ display: 'flex' }}>
      {choice.items.map((model, key) => {
        // Possibly throw error.
        if (model.type !== 'model') return null;

        return (
          <div
            key={key}
            style={{ borderBottom: currentId === model.id ? '2px solid #333' : '2px solid transparent', padding: 5 }}
            onClick={() => onChoice(model.id)}
          >
            {model.label}
          </div>
        );
      })}
    </div>
  );
};
