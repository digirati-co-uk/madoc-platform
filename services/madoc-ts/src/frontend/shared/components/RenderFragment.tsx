import React, { useMemo } from 'react';
import { useApi } from '../hooks/use-api';

export const RenderFragment: React.FC<{ fragment: string }> = ({ fragment }) => {
  const api = useApi();
  const decoded: string = useMemo(() => {
    if (api.getIsServer()) {
      return new Buffer(fragment, 'base64').toString('utf-8');
    }

    return atob(fragment);
  }, [api, fragment]);

  return <div dangerouslySetInnerHTML={{ __html: decoded }} />;
};
