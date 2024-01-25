import React, { useContext, useMemo } from 'react';
import { useProjectTemplate } from '../../../../shared/hooks/use-project-template';

export type ModelEditorConfig = {
  noCaptureModel?: boolean;
  preventChangeStructure?: boolean;
  preventChangeDocument?: boolean;
};

const ModelEditorConfigContext = React.createContext<ModelEditorConfig | null>(null);

ModelEditorConfigContext.displayName = 'ModelEditorConfig';

export const ModelEditorProvider: React.FC<{ template?: string }> = ({ template, children }) => {
  const config = useProjectTemplate(template);
  const editorConfig = config?.configuration?.captureModels;

  if (!editorConfig) {
    return <>{children}</>;
  }

  return <ModelEditorConfigContext.Provider value={editorConfig}>{children}</ModelEditorConfigContext.Provider>;
};

export function useModelEditorConfig(): Required<ModelEditorConfig> {
  const config = useContext(ModelEditorConfigContext);

  return useMemo(
    () => ({
      noCaptureModel: false,
      preventChangeStructure: false,
      preventChangeDocument: false,
      ...(config || {}),
    }),
    []
  );
}
