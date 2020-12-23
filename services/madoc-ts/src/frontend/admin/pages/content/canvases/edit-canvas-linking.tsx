import * as React from 'react';
import { UniversalComponent } from '../../../../types';
import { createUniversalComponent } from '../../../../shared/utility/create-universal-component';
import { ResourceLinkResponse } from '../../../../../database/queries/linking-queries';
import { useData } from '../../../../shared/hooks/use-data';
import { TableContainer } from '../../../../shared/atoms/Table';
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
    const { data, refetch } = useData(EditCanvasLinking);

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
