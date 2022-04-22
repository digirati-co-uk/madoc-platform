import styled, { css } from 'styled-components';
import { AnnotationStyles } from '../../../types/annotation-styles';

export const AnnotationStylePreviewList = styled.div`
  display: flex;
`;

export const AnnotationStylePreview = styled.div<{ data: AnnotationStyles['theme'] }>`
  width: 50px;
  height: 50px;
  margin-right: 0.4em;
  outline: 1px solid #f9f9f9;
  ${props => toStyle(props.data)}
`;

export function toStyle(style: any) {
  style.borderStyle = 'solid';

  return css(style);
}
