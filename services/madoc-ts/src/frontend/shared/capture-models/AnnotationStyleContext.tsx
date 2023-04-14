import React, { createContext, useContext, useMemo } from 'react';
import { AnnotationStyles } from '../../../types/annotation-styles';

export function getDefaultAnnotationStyles(): {
  currentLevel: { backgroundColor: string; borderColor: string; borderWidth: string };
  rejectedSubmissions: {
    backgroundColor: string;
    borderColor: string;
    ':hover': { backgroundColor: string; borderColor: string; borderWidth: string };
    borderWidth: string;
    interactive: boolean;
  };
  hidden: { borderColor: string; backgroundColor: string; borderWidth: string };
  highlighted: { backgroundColor: string; borderColor: string; borderWidth: string };
  topLevel: { backgroundColor: string; borderColor: string; borderWidth: string };
  submissions: {
    borderColor: string;
    backgroundColor: string;
    hidden: boolean;
    borderWidth: string;
    borderStyle: string;
  };
  contributedAnnotations: {
    backgroundColor: string;
    borderColor: string;
    hidden: boolean;
    ':hover': { backgroundColor: string; borderColor: string; borderWidth: string };
    borderWidth: string;
    interactive: boolean;
  };
  adjacent: { backgroundColor: string; borderColor: string; borderWidth: string };
  contributedDocument: {
    borderColor: string;
    backgroundColor: string;
    hidden: boolean;
    borderWidth: string;
    borderStyle: string;
  };
} {
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
      hidden: false,
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
      hidden: false,
      borderWidth: '1px',
      borderColor: 'rgba(87,36,203,0.5)',
      borderStyle: 'solid',
      backgroundColor: 'rgba(87,36,203,0.2)',
    },
    submissions: {
      hidden: false,
      borderWidth: '1px',
      borderColor: 'rgba(87,36,203,0.5)',
      borderStyle: 'solid',
      backgroundColor: 'rgba(87,36,203,0.2)',
    },
    rejectedSubmissions: {
      interactive: true,
      borderWidth: '1px',
      backgroundColor: 'rgba(0,0,0,0.2)',
      borderColor: 'rgba(5, 42, 68, 0.2)',
      ':hover': {
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderWidth: '1px',
        borderColor: 'rgba(5, 42, 68, 0.5)',
      },
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
