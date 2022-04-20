import { CreateAnnotationStyle } from './create-annotation-style';
import { EditAnnotationStyle } from './edit-annotation-style';
import { ListAnnotationStyles } from './list-annotation-styles';

export const annotationStylesRoutes = [
  {
    path: '/site/annotation-styles',
    exact: true,
    component: ListAnnotationStyles,
  },
  {
    path: '/site/annotation-styles/new',
    exact: true,
    component: CreateAnnotationStyle,
  },
  {
    path: '/site/annotation-styles/:id',
    exact: true,
    component: EditAnnotationStyle,
  },
];
