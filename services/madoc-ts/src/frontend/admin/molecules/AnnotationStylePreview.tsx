import styled, { css } from 'styled-components';
import { AnnotationBuckets, AnnotationStyles } from '../../../types/annotation-styles';

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

export const annotationBucketOrder: AnnotationBuckets[] = [
  'highlighted',
  'contributedAnnotations',
  'contributedDocument',
  'submissions',
  'topLevel',
  'currentLevel',
  'adjacent',
  'hidden',
];

export function toStyle(style: any) {
  style.borderStyle = 'solid';

  return css(style);
}

export const AnnotationStyleBigBackground = styled.div`
  padding: 2em;
  position: relative;
  background: linear-gradient(
    270deg,
    rgba(255, 121, 0, 1) 13%,
    rgb(50, 141, 147) 29%,
    rgb(107, 18, 182) 45%,
    rgba(255, 255, 255, 1) 57%,
    rgba(255, 255, 255, 1) 70%,
    rgba(0, 0, 0, 1) 85%
  );
`;

export const AnnotationStyleBigBox = styled.div`
  position: relative;
  text-align: center;
  padding: 1em;
  width: 100%;
  color: #fff;
  text-shadow: #000 1px 0 5px;
  margin-bottom: 1em;
`;
