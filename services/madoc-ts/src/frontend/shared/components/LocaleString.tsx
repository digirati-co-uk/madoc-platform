import { InternationalString } from '@hyperion-framework/types';
import { useTranslation } from 'react-i18next';
import React, { useMemo } from 'react';

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

export const useClosestLanguage = (getLanguages: () => string[], deps: any[] = []): string | undefined => {
  const { i18n } = useTranslation();

  const i18nLanguages = i18n && i18n.languages ? i18n.languages : [];
  const i18nLanguage = i18n && i18n.language ? i18n.language : 'en';

  return useMemo(() => {
    const languages = getLanguages();
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
  }, [i18nLanguages, i18nLanguage, ...deps]);
};

export const LocaleString: React.FC<{
  as?: string | React.FC<any>;
  defaultText?: string;
  to?: string;
  enableDangerouslySetInnerHTML?: boolean;
  children: InternationalString | null | undefined;
}> = ({ as: Component, defaultText, enableDangerouslySetInnerHTML, children, ...props }) => {
  const language = useClosestLanguage(() => Object.keys(children || {}), [children]);
  const text = useMemo(() => {
    if (!children) {
      return defaultText || '';
    }

    const candidateText = language ? children[language] : undefined;
    if (candidateText) {
      if (typeof candidateText === 'string') {
        return candidateText;
      }
      return candidateText.join('');
    }

    return '';
  }, [language, defaultText, children]);

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
