import { InternationalString } from '@hyperion-framework/types';
import { useTranslation } from 'react-i18next';
import React, { CSSProperties, useMemo } from 'react';

export const LanguageString: React.FC<{ [key: string]: any } & { as?: string | React.FC<any>; language: string }> = ({
  as: Component,
  language,
  children,
  ...props
}) => {
  const { i18n } = useTranslation();

  const viewingDirection = useMemo(() => (i18n.dir ? i18n.dir(language) : 'ltr'), [language]);

  const isSame = useMemo(() => {
    if (!i18n.services) {
      return false;
    }

    return (
      i18n.services.languageUtils.getLanguagePartFromCode(i18n.language) ===
      i18n.services.languageUtils.getLanguagePartFromCode(language)
    );
  }, [i18n.language, language]);

  if (isSame) {
    if (Component) {
      return <Component {...props}>{children}</Component>;
    }

    return <span {...props}>{children}</span>;
  }

  if (Component) {
    return (
      <Component {...props} lang={language} dir={viewingDirection}>
        {children}
      </Component>
    );
  }

  return (
    <span {...props} lang={language} dir={viewingDirection}>
      {children}
    </span>
  );
};

function getClosestLanguage(i18nLanguage: string, languages: string[], i18nLanguages: string[]) {
  if (languages.length === 0) {
    return undefined;
  }

  // Only one option.
  if (languages.length === 1) {
    return languages[0];
  }

  // Exact match.
  if (languages.indexOf(i18nLanguage) !== -1) {
    return i18nLanguage;
  }

  // Root match (en-us === en)
  const root = i18nLanguage.indexOf('-') !== -1 ? i18nLanguage.slice(0, i18nLanguage.indexOf('-')) : null;
  if (root && languages.indexOf(root) !== -1) {
    return root;
  }

  // All of the fall backs.
  for (const lang of i18nLanguages) {
    if (languages.indexOf(lang) !== -1) {
      return lang;
    }
  }

  if (languages.indexOf('none') !== -1) {
    return 'none';
  }

  if (languages.indexOf('@none') !== -1) {
    return '@none';
  }

  // Finally, fall back to the first.
  return languages[0];
}

export const useClosestLanguage = (getLanguages: () => string[], deps: any[] = []): string | undefined => {
  const { i18n } = useTranslation();

  const i18nLanguages = i18n && i18n.languages ? i18n.languages : [];
  const i18nLanguage = i18n && i18n.language ? i18n.language : 'en';

  return useMemo(() => {
    const languages = getLanguages();

    return getClosestLanguage(i18nLanguage, languages, i18nLanguages);
  }, [i18nLanguages, i18nLanguage, ...deps]);
};

export function useLocaleString(inputText: InternationalString | string | null | undefined, defaultText?: string) {
  const language = useClosestLanguage(() => Object.keys(inputText || {}), [inputText]);
  return [
    useMemo(() => {
      if (!inputText) {
        return defaultText || '';
      }
      if (typeof inputText === 'string') {
        return inputText;
      }

      const candidateText = language ? inputText[language] : undefined;
      if (candidateText) {
        if (typeof candidateText === 'string') {
          return candidateText;
        }
        return candidateText.join('\n');
      }

      return '';
    }, [language, defaultText, inputText]),
    language,
  ] as const;
}

export function useCreateLocaleString() {
  const { i18n } = useTranslation();

  const i18nLanguages = i18n && i18n.languages ? i18n.languages : [];
  const i18nLanguage = i18n && i18n.language ? i18n.language : 'en';

  return function createLocaleString(inputText: InternationalString | string | null | undefined, defaultText?: string) {
    const languages = Object.keys(inputText || {});
    const language = getClosestLanguage(i18nLanguage, languages, i18nLanguages);

    if (!inputText) {
      return defaultText || '';
    }
    if (typeof inputText === 'string') {
      return inputText;
    }

    const candidateText = language ? inputText[language] : undefined;
    if (candidateText) {
      if (typeof candidateText === 'string') {
        return candidateText;
      }
      return candidateText.join('\n');
    }

    return '';
  };
}

export const LocaleString: React.FC<{
  as?: string | React.FC<any>;
  defaultText?: string;
  to?: string;
  enableDangerouslySetInnerHTML?: boolean;
  children: InternationalString | null | undefined;
  style?: React.CSSProperties;
}> = ({ as: Component, defaultText, enableDangerouslySetInnerHTML, children, ...props }) => {
  const [text, language] = useLocaleString(children, defaultText);

  if (language) {
    return (
      <LanguageString
        {...props}
        as={Component}
        language={language}
        title={enableDangerouslySetInnerHTML ? undefined : text}
        dangerouslySetInnerHTML={
          enableDangerouslySetInnerHTML
            ? {
                __html: text,
              }
            : undefined
        }
      >
        {enableDangerouslySetInnerHTML ? undefined : text}
      </LanguageString>
    );
  }

  if (Component) {
    return <Component {...props}>{text}</Component>;
  }

  return (
    <span
      {...props}
      title={enableDangerouslySetInnerHTML ? undefined : text}
      dangerouslySetInnerHTML={
        enableDangerouslySetInnerHTML
          ? {
              __html: text,
            }
          : undefined
      }
    >
      {enableDangerouslySetInnerHTML ? undefined : text}
    </span>
  );
};
