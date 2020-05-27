import styled from 'styled-components';
import { Heading1 } from './Heading1';

export const Header = styled.div`
  margin-top: 0.5em;
  margin-bottom: 2.5em;
`;

export const ContextHeading = styled.div`
  font-size: 12px;
  & ~ ${Heading1} {
    margin-top: 0.3em;
  }
`;
