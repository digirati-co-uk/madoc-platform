import React, { useMemo } from 'react';
import { b64DecodeUnicode } from '../../../utility/base64';
import { useApi } from '../hooks/use-api';

export const RenderFragment: React.FC<{ fragment: string }> = ({ fragment }) => {
  const api = useApi();
  const decoded: string = useMemo(() => {
    if (api.getIsServer()) {
      return b64DecodeUnicode(fragment, b => new Buffer(b, 'base64').toString('utf-8'));
    }

    return b64DecodeUnicode(fragment, atob);
  }, [api, fragment]);

  return <div dangerouslySetInnerHTML={{ __html: decoded }} />;
};
