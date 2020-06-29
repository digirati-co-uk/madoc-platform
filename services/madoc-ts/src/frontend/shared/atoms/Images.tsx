import styled from 'styled-components';

export const CroppedImage = styled.div`
  background: #4e4e4e;
  padding: 2px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  img {
    display: inline-block;
    object-fit: contain;
    flex-shrink: 0;
    width: 100%;
    height: 100%;
  }
`;
