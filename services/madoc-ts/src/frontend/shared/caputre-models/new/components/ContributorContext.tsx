import { CaptureModel } from '@capture-models/types';
import React, { useContext } from 'react';

const ContributorReactContext = React.createContext<CaptureModel['contributors']>({});

export const ContributorProvider = ContributorReactContext.Provider;

export const useContributors = (): CaptureModel['contributors'] => {
  return useContext(ContributorReactContext) || {};
};
