import React, { createContext, useContext, useMemo } from 'react';
import { AnnotationStyles } from '../../../types/annotation-styles';

export function getDefaultAnnotationStyles(): AnnotationStyles['theme'] {
  return {
    highlighted: {
      backgroundColor: 'rgba(75, 103, 225, 0.4)',
      borderWidth: '1px',
      borderColor: '#4B67E1',
    },
    hidden: {
      borderWidth: '0px',
      borderColor: 'rgba(0,0,0,0)',
      backgroundColor: 'rgba(0,0,0,0)',
    },
    adjacent: {
      backgroundColor: 'rgba(141,160,203,.1)',
      borderWidth: '1px',
      borderColor: 'rgba(5, 42, 68, 0.2)',
    },
    currentLevel: {
      backgroundColor: 'rgba(0,0,0,0)',
      borderWidth: '2px',
      borderColor: 'rgba(252,0,98, .5)',
    },
    topLevel: {
      backgroundColor: 'rgba(141,160,203,.15)',
      borderWidth: '1px',
      borderColor: 'rgba(5, 42, 68, 0.2)',
    },

    // New ones, hidden by default?
    contributedAnnotations: {
      interactive: true,
      borderWidth: '1px',
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgba(5, 42, 68, 0.2)',
      ':hover': {
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: '1px',
        borderColor: 'rgba(5, 42, 68, 0.5)',
      },
    },
    contributedDocument: {
      hidden: true,
      borderWidth: '0px',
      borderColor: 'rgba(0,0,0,0)',
      backgroundColor: 'rgba(0,0,0,0)',
    },
    submissions: {
      hidden: true,
      borderWidth: '0px',
      borderColor: 'rgba(0,0,0,0)',
      backgroundColor: 'rgba(0,0,0,0)',
    },
  };
}
const AnnotationStyleContext = createContext<AnnotationStyles['theme']>(getDefaultAnnotationStyles());

export function useAnnotationStyles() {
  return useContext(AnnotationStyleContext);
}

export function AnnotationStyleProvider({
  theme,
  children,
}: {
  theme?: AnnotationStyles['theme'];
  children: React.ReactNode;
}) {
  const styles = useMemo(() => {
    return theme || getDefaultAnnotationStyles();
  }, [theme]);

  return <AnnotationStyleContext.Provider value={styles}>{children}</AnnotationStyleContext.Provider>;
}
