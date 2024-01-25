import React, { createContext, ReactElement, useContext } from 'react';
import { useTranslation, UseTranslationOptions } from 'react-i18next';

const ModelNamespace = createContext('capture-models');

ModelNamespace.displayName = 'ModelNamespace';

export function WithModelNamespace(props: { namespace: string; children: ReactElement }) {
  return <ModelNamespace.Provider value={props.namespace}>{props.children}</ModelNamespace.Provider>;
}

export function useModelTranslation(options?: UseTranslationOptions) {
  const ns = useContext(ModelNamespace);

  return useTranslation(ns || 'capture-models', options);
}
