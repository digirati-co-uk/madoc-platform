import styled from 'styled-components';

export const ImageStripBox = styled.div<{ $size?: 'large' | 'small' }>`
  padding: 5px;
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '160px';
      case 'large':
        return '310px';
      default:
        return '251px';
    }
  }};

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
  a {
    text-decoration: none;
  }
`;
