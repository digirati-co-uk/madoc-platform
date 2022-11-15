import React from 'react';
import styled from 'styled-components';
import ReactTooltip from 'react-tooltip';
// import { ArrowRight } from '@styled-icons/bootstrap/ArrowRight';

export const Brick = styled.button`
  background-color: #1b1b72;
  color: white;
  border-radius: 15px;
  width: 250px;
  padding: 20px;
  //height: 60px;
  font-size: 18px;
  border: none;
  display: block;

  :hover {
    cursor: pointer;
    color: #1b1b72;
    background-color: white;
  }
`;
export const TileOverlay = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  text-align: center;
  color: white;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 15px;
  width: 210px;
  height: 210px;
  z-index: 2;
`;

export const TileLink = styled.button`
  font-size: 14px;
  font-weight: 500;
  background-color: transparent;
  border: none;
  color: white;

  svg {
    width: 20px;
    margin: 2px;
  }

  :hover {
    text-decoration: underline;
    cursor: pointer;
  }

  :focus {
    text-decoration: underline;
    cursor: pointer;
  }
`;

export const Tile = styled.div`
  color: black;
  width: 211px;
  font-size: 20px;
  position: relative;
  margin: 20px;
  img {
    filter: blur(2px);
  }

  small {
    font-size: 13px;
    font-weight: 400;
    text-transform: capitalize;
  }

  &:not(:hover, :focus, :active, :focus-visible, :focus-within) {
    ${TileOverlay} {
      visibility: hidden;
    }
    img {
      filter: blur(0);
    }
  }
`;

export const TileImage = styled.img`
  width: 210px;
  height: 210px;
  border-radius: 15px;
  z-index: 0;
`;

export const Note = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 100%;
  margin-left: 0.5em;
  align-self: center;
`;

export const Tiles: React.FC<{
  type?: string;
  title?: any;
  subTitle?: string;
  image?: string;
  onClick?: any;
  linkTitle?: string;
  published?: boolean;
}> = ({ type, title, subTitle, image, published, onClick, linkTitle }) => {
  return (
    <>
      {type === 'brick' ? (
        <Brick
          onClick={() => {
            onClick();
          }}
        >
          {title}
        </Brick>
      ) : (
        <Tile tabIndex={0}>
          <TileOverlay>
            <TileLink
              onClick={() => {
                onClick();
              }}
              aria-label={'thumbnail'}
            >
              {linkTitle}
            </TileLink>
          </TileOverlay>
          <TileImage src={image} alt={'thumbnail'} />
          <div style={{ display: 'flex' }}>
            <small>{subTitle}</small>
            <Note
              data-tip={published ? 'published' : 'not published'}
              style={{ backgroundColor: published ? 'green' : 'red' }}
            />
            <ReactTooltip place="bottom" type="dark" effect="solid" />
          </div>
          {title}
        </Tile>
      )}
    </>
  );
};
