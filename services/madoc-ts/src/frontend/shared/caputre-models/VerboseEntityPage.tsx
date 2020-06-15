import { BaseField, CaptureModel } from '@capture-models/types';
import React, { useState } from 'react';
import { EntityTopLevel } from './EntityTopLevel';
import { VerboseFieldPage } from './VerboseFieldPage';

export const VerboseEntityPage: React.FC<{
  title?: string;
  description?: string;
  entity: { property: string; instance: CaptureModel['document'] };
  path: Array<[string, string]>;
  goBack?: () => void;
  showNavigation?: boolean;
  readOnly?: boolean;
  staticBreadcrumbs?: string[];
  hideSplash?: boolean;
  hideCard?: boolean;
}> = ({ path, readOnly, children, ...props }) => {
  const [selectedField, setSelectedField] = useState<{ property: string; instance: BaseField }>();
  const [selectedEntity, setSelectedEntity] = useState<{ property: string; instance: CaptureModel['document'] }>();

  if (selectedField) {
    return (
      <VerboseFieldPage
        readOnly={readOnly}
        field={selectedField}
        path={[...path, [selectedField.property, selectedField.instance.id]]}
        goBack={() => setSelectedField(undefined)}
      />
    );
  }

  if (selectedEntity) {
    return (
      <VerboseEntityPage
        readOnly={readOnly}
        entity={selectedEntity}
        path={[...path, [selectedEntity.property, selectedEntity.instance.id]]}
        goBack={() => setSelectedEntity(undefined)}
      />
    );
  }

  return (
    <EntityTopLevel
      setSelectedField={setSelectedField}
      setSelectedEntity={setSelectedEntity}
      path={path}
      readOnly={readOnly}
      {...props}
    >
      {children}
    </EntityTopLevel>
  );
};
