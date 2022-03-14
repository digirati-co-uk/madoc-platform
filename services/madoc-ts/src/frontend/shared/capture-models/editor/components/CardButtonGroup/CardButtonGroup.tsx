import styled from 'styled-components';

export const CardButtonGroup = styled.div<{ spacing?: string }>`
  display: flex;
  flex-direction: row;
  & > * + * {
    margin-left: ${props => (props.spacing ? props.spacing : '10px')};
  }
`;
