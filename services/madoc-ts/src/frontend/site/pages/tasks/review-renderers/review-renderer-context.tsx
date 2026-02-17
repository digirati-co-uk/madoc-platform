import React, { useContext } from 'react';
import { ReviewRendererContextValue } from './types';

const ReviewRendererContext = React.createContext<ReviewRendererContextValue | null>(null);

export const ReviewRendererContextProvider: React.FC<{
  value: ReviewRendererContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <ReviewRendererContext.Provider value={value}>{children}</ReviewRendererContext.Provider>;
};

export function useReviewRendererContext(): ReviewRendererContextValue {
  const context = useContext(ReviewRendererContext);
  if (!context) {
    throw new Error('useReviewRendererContext must be used inside ReviewRendererContextProvider');
  }
  return context;
}
