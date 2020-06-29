import styled from 'styled-components';

export const ImageGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  margin: 1em -10px;
  & > * {
    margin: 10px;
  }
`;

export const ImageGridItem = styled.div`
  padding: 0.5em;
  width: 190px;
  display: flex;
  flex-direction: column;
  border-radius: 3px;
  justify-content: center;
  &:hover {
    cursor: pointer;
    background: #eee;
  }
`;
