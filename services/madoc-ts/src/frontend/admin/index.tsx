import React, { useMemo } from 'react';
import { ApiClient } from '../../gateway/api';
import { useTranslation } from 'react-i18next';
import { renderUniversalRoutes } from '../shared/utility/server-utils';
import { ApiContext, useIsApiRestarting } from '../shared/hooks/use-api';
import { ErrorMessage } from '../shared/atoms/ErrorMessage';
import { UniversalRoute } from '../types';

export type AdminAppProps = {
  jwt?: string;
  api: ApiClient;
  routes: UniversalRoute[];
};

const AdminApp: React.FC<AdminAppProps> = ({ api, routes }) => {
  const { i18n } = useTranslation();
  const restarting = useIsApiRestarting(api);

  const viewingDirection = useMemo(() => i18n.dir(i18n.language), [i18n.language]);

  return (
    <div lang={i18n.language} dir={viewingDirection}>
      {restarting ? <ErrorMessage>Lost connection to server, retrying... </ErrorMessage> : null}
      <ApiContext.Provider value={api}>{renderUniversalRoutes(routes)}</ApiContext.Provider>
    </div>
  );
};

export default AdminApp;
