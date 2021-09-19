import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
import { EmptyState } from '../../../../shared/layout/EmptyState';
import { LinkingProperty } from '../../../../shared/atoms/LinkingProperty';
import { Spinner } from '../../../../shared/icons/Spinner';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { useData } from '../../../../shared/hooks/use-data';
import { TableContainer } from '../../../../shared/layout/Table';
import { useParams } from 'react-router-dom';

type EditManifestLinkingType = {
  query: {};
  params: { id: string };
  data: { linking: ResourceLinkResponse[] };
  variables: { id: number };
};

export const EditManifestLinking: UniversalComponent<EditManifestLinkingType> = createUniversalComponent<
  EditManifestLinkingType
>(
  props => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const { data, refetch, isFetching } = useData(EditManifestLinking);

    if (isFetching) {
      return <Spinner />;
    }

    if (data && data.linking.length === 0) {
      return <EmptyState>{t('No linking properties')}</EmptyState>;
    }

    return (
      <TableContainer style={{ background: '#EEEEEE' }}>
        {data?.linking.map(item => {
          return <LinkingProperty linkProps={{ manifestId: id }} key={item.link.id} link={item} refetch={refetch} />;
        })}
      </TableContainer>
    );
  },
  {
    getKey(params) {
      return ['manifest-linking', { id: Number(params.id) }];
    },
    getData(key, vars, api) {
      return api.getManifestLinking(vars.id);
    },
  }
);
