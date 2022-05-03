import { useTranslation, UseTranslationOptions } from 'react-i18next';

export function useModelTranslation(options?: UseTranslationOptions) {
  return useTranslation('capture-models', options);
}
