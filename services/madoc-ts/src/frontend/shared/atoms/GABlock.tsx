import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Helmet as _Helmet } from 'react-helmet';
export const GABlock: React.FC<{ gtag: string }> = ({ gtag }) => {
  const Helmet = _Helmet as any;
  if (gtag && gtag !== '') {
    return (
      <Helmet>
        {/* Global site tag (gtag.js) - Google Analytics  */}
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${gtag}`}></script>
        <script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', "${gtag}");
        `}
        </script>
      </Helmet>
    );
  }

  return null;
};
blockEditorFor(GABlock, {
  label: 'Google analytics basic',
  type: 'default.GABlock',
  defaultProps: { gtag: '' },
  editor: {
    gtag: { type: 'text-field', label: 'Paste Measurement Id ' },
  },
});
