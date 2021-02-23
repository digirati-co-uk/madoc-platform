import { useEffect, useMemo } from 'react';

const defaultOptions = {
  display: 'swap',
};

type Options = {
  display?: string;
};

export const useGoogleFonts = (
  inputFonts?: string | Array<[string, string] | [string]>,
  options: Options = defaultOptions
): void => {
  const fonts = useMemo(() => {
    if (!inputFonts) {
      return [];
    }

    return typeof inputFonts === 'string' ? [[inputFonts]] : inputFonts;
  }, [inputFonts]);
  const fontsWithSizes = fonts.map(fontArray => {
    const font = fontArray[0].replace(new RegExp(' ', 'g'), '+');
    let sizes = '';

    if (fontArray.length === 2) {
      sizes = ':' + fontArray[1];
    }

    return font + sizes;
  });

  const fontsUri = fontsWithSizes.join('|');
  const swap = `&display=${options.display}`;

  useEffect(() => {
    if (fonts && fonts.length) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css?family=${fontsUri + swap}`;
      link.rel = 'stylesheet';

      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [fonts, fontsUri, swap]);
};
