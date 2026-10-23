import { AnnotationPages } from '../../../features/annotations/AnnotationPages';
import * as React from 'react';
import { ResourceLinkResponse } from '../../../../../types/schemas/linking';
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
    const { id, manifestId } = useParams<{ id: string; manifestId: string }>();
    const { data, refetch, isFetching } = useData(EditCanvasLinking);

    if (isFetching) {
      return <Spinner />;
    }

    return (
      <>
        <TableContainer style={{ background: '#EEEEEE' }}>
          <AnnotationPages resourceId={Number(id)} allowBackfill={false} />
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
      </>
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
