import styled from 'styled-components';

export const MoreDot = styled.div`
  height: 6px;
  width: 6px;
  background: #9a9a9a;
  border-radius: 50%;
  margin: 2px;
`;

export const MoreIconContainer = styled.div`
  background: #e4e4e4;
  padding: 0.5em;
  border-radius: 6px;
  display: flex;
  cursor: pointer;
  margin: 0.5em auto;
`;

export const MoreContainer = styled.div`
  justify-content: center;
  width: 100px;
  height: 100px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  &:hover ${MoreIconContainer} {
    background: #ccc;
    ${MoreDot} {
      background: #777;
    }
  }
`;

export const MoreLabel = styled.div`
  font-size: 0.85em;
  text-align: center;
  color: #999;
`;
