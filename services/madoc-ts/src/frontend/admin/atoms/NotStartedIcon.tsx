import styled from 'styled-components';

export const NotStartedIcon = styled.div<{ accepted?: boolean }>`
  height: 10px;
  width: 10px;
  margin: 6px;
  border-radius: 50%;
  background: ${props => (props.accepted ? '#88a2ef' : '#ccc')};
`;
