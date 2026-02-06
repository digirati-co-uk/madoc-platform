import React, { createContext, FC, useContext, useMemo } from 'react';

// React context
export interface CaptureModelVisualSettings {
  descriptionTooltip?: boolean;
}

const defaults: CaptureModelVisualSettings = {
  descriptionTooltip: false,
};
export const CaptureModelVisualSettingsContext = createContext<CaptureModelVisualSettings>({
  descriptionTooltip: false,
});

CaptureModelVisualSettingsContext.displayName = 'CaptureModelVisualSettings';

export function useCaptureModelVisualSettings() {
  return useContext(CaptureModelVisualSettingsContext);
}

export const CaptureModelVisualSettingsProvider: FC<Partial<CaptureModelVisualSettings> & { children?: React.ReactNode }> = ({ children, ...props }) => {
  const config = useMemo(() => {
    return {
      ...defaults,
      ...props,
    };
  }, [props]);

  return (
    <CaptureModelVisualSettingsContext.Provider value={config}>{children}</CaptureModelVisualSettingsContext.Provider>
  );
};
