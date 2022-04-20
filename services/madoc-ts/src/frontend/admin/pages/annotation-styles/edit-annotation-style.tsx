import React from 'react';
import { AnnotationStyles } from '../../../../types/annotation-styles';
import { LoadingBlock } from '../../../shared/callouts/LoadingBlock';
import { useData } from '../../../shared/hooks/use-data';
import { serverRendererFor } from '../../../shared/plugins/external/server-renderer-for';
import { CreateAnnotationStyle } from './create-annotation-style';

export function EditAnnotationStyle() {
  const { data } = useData<AnnotationStyles>(EditAnnotationStyle);

  if (!data) {
    return <LoadingBlock />;
  }

  return <CreateAnnotationStyle existing={data} />;
}

serverRendererFor(EditAnnotationStyle, {
  getKey: params => ['getAnnotationStyle', { id: params.id }],
  getData: (key, vars, api) => api.getAnnotationStyle(vars.id),
});
