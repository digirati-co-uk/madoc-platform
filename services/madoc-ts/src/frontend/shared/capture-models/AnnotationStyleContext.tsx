import React, { createContext, useContext, useMemo } from 'react';
import { AnnotationStyles } from '../../../types/annotation-styles';

export function getDefaultAnnotationStyles(): AnnotationStyles['theme'] {
  return {
    highlighted: {
      backgroundColor: 'rgba(75, 103, 225, 0.4)',
      borderWidth: '1px',
      borderColor: 'rgba(75,103,225,0.99)',
    },
    hidden: {
      borderWidth: '0px',
      borderColor: 'rgba(0,0,0,0)',
      backgroundColor: 'rgba(0,0,0,0)',
    },
    adjacent: {
      backgroundColor: 'rgba(123,144,196,0.2)',
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
      hidden: false,
      interactive: true,
      borderWidth: '2px',
      backgroundColor: 'rgba(0,0,0,0)',
      borderColor: 'rgba(206, 0, 233, 0.6)',
      ':hover': {
        backgroundColor: 'rgba(0,0,0,0)',
        borderWidth: '1px',
        borderColor: 'rgba(206, 0, 233, 0.9)',
      },
    },
    contributedDocument: {
      hidden: false,
      borderWidth: '2px',
      borderColor: 'rgba(87,36,203,0.5)',
      backgroundColor: 'rgba(87,36,203,0.2)',
    },
    submissions: {
      hidden: false,
      borderWidth: '2px',
      borderColor: 'rgba(19,0,59,0.5)',
      backgroundColor: 'rgba(87,36,203,0.27)',
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
