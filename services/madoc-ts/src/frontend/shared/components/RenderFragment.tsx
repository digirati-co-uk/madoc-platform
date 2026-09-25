import React, { useMemo } from 'react';
import { b64DecodeUnicode } from '../../../utility/base64';
import { useApi } from '../hooks/use-api';
import { setHtmlLinkTargets } from '../utility/link-targets';

export const RenderFragment: React.FC<{ fragment: string; openInNewTab?: boolean }> = ({ fragment, openInNewTab }) => {
  const api = useApi();
  const decoded: string = useMemo(() => {
    if (api.getIsServer()) {
      return b64DecodeUnicode(fragment, b => new Buffer(b, 'base64').toString('utf-8'));
    }

    return b64DecodeUnicode(fragment, atob);
  }, [api, fragment]);

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: openInNewTab === undefined ? decoded : setHtmlLinkTargets(decoded, openInNewTab),
      }}
    />
  );
};
