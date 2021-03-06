import styled from 'styled-components';

export const CroppedImage = styled.div<{ $size?: 'small' | 'large' }>`
  background: #000;
  padding: 2px;
  height: ${props => {
    switch (props.$size) {
      case 'small':
        return '150px';
      case 'large':
        return '294px';
      default:
        return '222px';
    }
  }};
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '150px';
      case 'large':
        return '294px';
      default:
        return '222px';
    }
  }};
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

export const CoveredImage = styled.div`
  overflow: hidden;
  margin: 0.5em;
  border-radius: 5px;

  img {
    object-fit: cover;
    object-position: 50% 50%;
    display: block;

    height: 130px;
    width: 100%;
  }
`;
