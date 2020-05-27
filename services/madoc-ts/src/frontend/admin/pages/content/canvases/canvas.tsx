import React from 'react';
import { useTranslation } from 'react-i18next';
import { UniversalComponent } from '../../../../types';
import { LocaleString } from '../../../../shared/components/LocaleString';
import { Subheading1 } from '../../../../shared/atoms/Heading1';
import { ButtonRow, TinyButton } from '../../../../shared/atoms/Button';
import { Link, useParams, useLocation } from 'react-router-dom';
import { renderUniversalRoutes } from '../../../../shared/utils/server-utils';
import { CanvasFull } from '../../../../../types/schemas/canvas-full';
import { ContextHeading, Header } from '../../../../shared/atoms/Header';
import { useData } from '../../../../shared/hooks/use-data';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';

type CanvasViewType = {
  data: CanvasFull;
  query: {};
  params: { id: string };
  variables: { id: number };
};

export const CanvasView: UniversalComponent<CanvasViewType> = createUniversalComponent<CanvasViewType>(
  ({ route }) => {
    const { t } = useTranslation();
    const params = useParams<{ manifestId?: string }>();
    const location = useLocation();
    const { data, status } = useData(CanvasView);

    if (status !== 'success' || !data) {
      return <div>loading...</div>;
    }

    const { canvas } = data;

    return (
      <>
        <Header>
          <ContextHeading>{canvas.label ? <LocaleString>{canvas.label}</LocaleString> : 'Untitled'}</ContextHeading>
          {params.manifestId ? (
            <Subheading1>
              <Link to={`/manifests/${params.manifestId}`}>Go back to manifest</Link>
            </Subheading1>
          ) : null}
        </Header>
        <ButtonRow>
          <TinyButton as={Link} to={`${location.pathname}/metadata`}>
            {t('edit metadata')}
          </TinyButton>
        </ButtonRow>

        {renderUniversalRoutes(route.routes)}
      </>
    );
  },
  {
    async getData(key, vars, api) {
      return await api.getCanvasById(vars.id);
    },
    getKey(params) {
      return ['view-canvas', { id: Number(params.id) }];
    },
  }
);
