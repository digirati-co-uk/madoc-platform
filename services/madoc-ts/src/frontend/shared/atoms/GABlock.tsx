import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { Helmet as _Helmet } from 'react-helmet';

export const GABlock: React.FC<{ gtag: string }> = ({ gtag }) => {
  const Helmet = _Helmet as any;
  if (gtag && gtag !== '') {
    return (
      <Helmet>
        <script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
          'ad_storage': 'denied',
          'analytics_storage': 'denied',
          'functionality_storage': 'denied',
          'personalization_storage': 'denied',
          'security_storage': 'denied'
          });
        `}
        </script>
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
  } else return null;
};

blockEditorFor(GABlock, {
  label: 'Google analytics basic',
  type: 'default.GABlock',
  defaultProps: { gtag: '' },
  editor: {
    gtag: { type: 'text-field', label: 'Paste Measurement Id ' },
  },
});
