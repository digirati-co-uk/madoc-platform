import React from 'react';
import { CreateAnnotationStyle } from './create-annotation-style';
import { EditAnnotationStyle } from './edit-annotation-style';
import { ListAnnotationStyles } from './list-annotation-styles';

export const annotationStylesRoutes = [
  {
    path: '/site/annotation-styles',
    element: <ListAnnotationStyles />,
  },
  {
    path: '/site/annotation-styles/new',
    element: <CreateAnnotationStyle />,
  },
  {
    path: '/site/annotation-styles/:id',
    element: <EditAnnotationStyle />,
  },
];
