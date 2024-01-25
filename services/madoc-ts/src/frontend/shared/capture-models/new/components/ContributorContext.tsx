import React, { useContext } from 'react';
import { CaptureModel } from '../../types/capture-model';

const ContributorReactContext = React.createContext<CaptureModel['contributors']>({});

ContributorReactContext.displayName = 'Contributors';

export const ContributorProvider = ContributorReactContext.Provider;

export const useContributors = (): CaptureModel['contributors'] => {
  return useContext(ContributorReactContext) || {};
};
