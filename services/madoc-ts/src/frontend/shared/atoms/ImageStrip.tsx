import styled from 'styled-components';

export const ImageStripBox = styled.div`
  margin: 10px 10px 10px 0px;
  padding: 5px;
  width: 170px;

  &:hover {
    background: #eee;
    cursor: pointer;
  }
`;

export const ImageStrip = styled.div`
  display: flex;
  overflow-x: auto;
  text-decoration: none;
  ${ImageStripBox} ~ ${ImageStripBox} {
    margin-left: 10px;
  }
`;
