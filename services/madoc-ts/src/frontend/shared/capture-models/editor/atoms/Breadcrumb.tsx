import styled from 'styled-components';

export const Breadcrumb = styled.div`
  line-height: 1;
  display: inline-block;
  margin: 0 0;
  vertical-align: middle;
  font-size: 1em;
  cursor: pointer;
  &:last-child {
    color: #333;
  }
`;
export const BreadcrumbSection = styled.div`
  display: inline-block;
  margin: 0;
  padding: 0;
`;
export const BreadcrumbDivider = styled.div`
  display: inline-block;
  opacity: 0.7;
  margin: 0 0.21428571rem 0;
  font-size: 0.92857143em;
  color: rgba(0, 0, 0, 0.4);
  vertical-align: baseline;
`;
