import styled from 'styled-components';
import { getTheme } from '../../themes';

export const BackBanner = styled.div`
  background: ${props => getTheme(props).colors.mutedPrimary};
  color: ${props => getTheme(props).colors.textOnMutedPrimary};
  padding: 0.3em 30px;
`;
