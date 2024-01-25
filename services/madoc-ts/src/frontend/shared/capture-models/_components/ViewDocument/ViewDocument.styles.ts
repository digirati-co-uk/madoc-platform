import styled, { css } from 'styled-components';

export const DocumentLabel = styled.div`
  position: relative;
  font-size: 13px;
  font-weight: 500;
  color: #555;
  display: flex;
  align-items: center;
`;

export const DocumentLabelIcon = styled.div`
  //position: absolute;
  //right: 2px;
  //top: 2px;
  margin-left: auto;
`;

export const DocumentDescription = styled.div`
  font-size: 13px;
  color: #999;
`;

export const DocumentHeading = styled.div<{ $interactive?: boolean }>`
  margin: 5px 0;
  ${props =>
    props.$interactive &&
    css`
      cursor: pointer;
    `}
`;

export const DocumentValueWrapper = styled.div`
  //background: palegoldenrod;
`;

export const DocumentSection = styled.div`
  border-bottom: 1px solid #eff3fd;
  background: #fff;
  overflow: hidden;
  margin: 0.4em;
  border-radius: 3px;
  outline: 3px solid transparent;
  transition: outline-color 1s;
  &[data-highlighted='true'] {
    outline-color: orangered;
  }
`;

export const FieldSection = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  outline: 3px solid transparent;
  transition: outline-color 1s;
  &[data-highlighted='true'] {
    outline-color: orangered;
  }
`;

export const DocumentSectionField = styled.div`
  padding-bottom: 0.4em;
  margin-bottom: 0.2em;
  background: #fff;
  outline: 3px solid transparent;
  transition: outline-color 1s;
  &[data-highlighted='true'] {
    outline-color: orangered;
  }
`;

export const DocumentCollapse = styled.div`
  background: #fff;
  padding: 10px;
  overflow-y: auto;
`;

export const DocumentEntityList = styled.div`
  padding: 2px;
  background: #e9effc;
  border-radius: 5px;
  overflow-y: auto;
`;

export const DocumentEntityLabel = styled.div`
  color: #777;
  font-weight: 600;
  font-size: 15px;
  position: relative;
  padding: 5px 10px;
`;

export const FieldPreviewWrapper = styled.div`
  white-space: pre-wrap;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  row-gap: 0.5em;
  overflow: auto;
`;
