import { CreateAnnotationStyle } from './create-annotation-style';
import { EditAnnotationStyle } from './edit-annotation-style';
import { ListAnnotationStyles } from './list-annotation-styles';
import { PreviewAnnotationStyle } from './preview-annotation-style';

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
    component: PreviewAnnotationStyle,
  },
  {
    path: '/site/annotation-styles/:id/edit',
    exact: true,
    component: EditAnnotationStyle,
  },
];
