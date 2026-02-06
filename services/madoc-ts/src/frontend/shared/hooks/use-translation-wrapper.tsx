import { TFunction } from 'i18next';
import React, { useCallback, useMemo } from 'react';
import { Namespace, useTranslation as useTranslationOriginal, UseTranslationOptions } from 'react-i18next';

/**
 * Possibly future wrapper for useTranslation hook to enable inline translations.
 *
 * @param ns
 * @param options
 */
export function useTranslationWrapper(
  ns?: Namespace,
  options?: UseTranslationOptions
): {
  t: TFunction;
  i18n: UseTranslationOptions['i18n'];
  ready: boolean;
} {
  const { t, i18n, ready } = useTranslationOriginal(ns, options);

  const customT = useCallback(
    (...args: any[]) => {
      return <span>{t.apply(t, args as any) as any}</span>;
    },
    [t]
  );

  return useMemo(
    () => ({
      t: customT as any,
      i18n,
      ready,
    }),
    [customT, t, i18n, ready]
  );
}
