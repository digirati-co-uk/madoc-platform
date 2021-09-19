import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { Spinner } from '../../../../shared/icons/Spinner';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useData } from '../../../../shared/hooks/use-data';
import { TableContainer } from '../../../../shared/layout/Table';
import { LinkingProperty } from '../../../../shared/atoms/LinkingProperty';
import { useParams } from 'react-router-dom';

type EditCanvasLinking = {
  query: {};
  params: { id: string };
  data: { linking: ResourceLinkResponse[] };
  variables: { id: number };
  context: { manifestId?: number };
};

export const EditCanvasLinking: UniversalComponent<EditCanvasLinking> = createUniversalComponent<EditCanvasLinking>(
  () => {
    const { t } = useTranslation();
    const { id, manifestId } = useParams<{ id: string; manifestId: string }>();
    const { data, refetch, isFetching } = useData(EditCanvasLinking);

    if (isFetching) {
      return <Spinner />;
    }

    if (data && data.linking.length === 0) {
      return <EmptyState>{t('No linking properties')}</EmptyState>;
    }

    return (
      <TableContainer style={{ background: '#EEEEEE' }}>
        {data?.linking.map(item => {
          return (
            <LinkingProperty
              linkProps={{ canvasId: id, manifestId }}
              key={item.link.id}
              link={item}
              refetch={refetch}
            />
          );
        })}
      </TableContainer>
    );
  },
  {
    getKey(params) {
      return ['canvas-linking', { id: Number(params.id) }];
    },
    getData(key, vars, api) {
      return api.getCanvasLinking(vars.id);
    },
  }
);
