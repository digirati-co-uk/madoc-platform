import { AnnotationPages } from '../../../features/annotations/AnnotationPages';
import React from 'react';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
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

export const EditManifestLinking: UniversalComponent<EditManifestLinkingType> =
  createUniversalComponent<EditManifestLinkingType>(
    props => {
      const { id } = useParams<{ id: string }>();
      const { data, refetch, isFetching } = useData(EditManifestLinking);

      if (isFetching) {
        return <Spinner />;
      }

      return (
        <>
          <TableContainer style={{ background: '#EEEEEE' }}>
            <AnnotationPages resourceId={Number(id)} allowBackfill={true} />
            {data?.linking.map(item => {
              return (
                <LinkingProperty linkProps={{ manifestId: id }} key={item.link.id} link={item} refetch={refetch} />
              );
            })}
          </TableContainer>
        </>
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
