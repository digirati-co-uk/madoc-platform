import styled from 'styled-components';

export const Heading5 = styled.h5`
  margin-top: 0.5em;
  font-size: 0.9em;
  color: #333;
  font-weight: normal;
  text-decoration: none;
  margin-bottom: 0;
`;

export const SingleLineHeading5 = styled(Heading5)`
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
`;

export const Subheading5 = styled.div`
  font-size: 0.9em;
  color: #999;
  margin-bottom: 0.5em;
`;
