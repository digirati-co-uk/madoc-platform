import styled from 'styled-components';

export const Heading4 = styled.h4`
  margin-top: 0.55em;
  font-size: 1em;
  color: #333;
  font-weight: normal;
  text-decoration: none;
  margin-bottom: 0;
`;

export const SingleLineHeading4 = styled(Heading4)`
  overflow: hidden;
  text-overflow: ellipsis;
  text-decoration: none;
  white-space: nowrap;
`;

export const Subheading4 = styled.div`
  font-size: 0.95em;
  color: #999;
  margin-bottom: 0.5em;
`;
