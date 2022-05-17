import { InternationalString } from '@iiif/presentation-3';
import { useRef } from 'react';
import * as React from 'react';
import styled, { css } from 'styled-components';
import { Button } from '../navigation/Button';
import { HrefLink } from '../utility/href-link';
import { LocaleString } from './LocaleString';

type IIIFHeroProps = {
  title: InternationalString;
  description?: InternationalString;
  button?: {
    title: InternationalString;
    link: string;
    isExternal?: boolean;
  };
  backgroundImage?: string | null;
  asset?: {
    label: InternationalString;
    attribution: InternationalString;
    backgroundColor?: string;
    thumbnails: string[];
    link?: string;
  };
};

const HeroContainer = styled.div<{ $noAsset?: boolean }>`
  height: 600px;
  display: flex;
  position: relative;
  overflow: hidden;
  ${props =>
    props.$noAsset &&
    css`
      height: 400px;
    `}
`;

const HeroBackground = styled.div<{ $image?: string }>`
  background-image: url("${props => props.$image}");
  background-size: cover;
  background-position: 50% 50%;
  transform: scale(1.1);
  filter: blur(20px);
  opacity: 0.6;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
`;

const HeroAssetContainer = styled.div`
  z-index: 2;
  width: 520px;
  min-width: 0;
  overflow: hidden;
  margin: 4em 2em;
  background-image: linear-gradient(146deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 62%);
  box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.08), 0 4px 21px 0 rgba(0, 0, 0, 0.23);
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  padding-bottom: 2.5em;
  text-decoration: none;
`;

const HeroAssetThumbnails = styled.div<{ $background: string }>`
  display: flex;
  flex: 1 1 0px;
  flex-basis: fit-content;
  margin: 3em;
  margin-bottom: 1.5em;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 30px;
    background: #000;
    filter: blur(20px);
    bottom: 0;
    z-index: 1;
  }
  &:before {
    content: '';
    position: absolute;
    right: -3.5em;
    top: -0.5em;
    bottom: -0.5em;
    filter: blur(2px);
    background-image: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, ${props => props.$background} 80%);
    width: 5em;
    z-index: 3;
    pointer-events: none;
  }
`;

const HeroAssetLargeThumbnail = styled.div`
  z-index: 2;
  img {
    height: 280px;
    object-fit: contain;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.53);
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.02);
    }
  }
`;

const HeroAssetThumbnail = styled.div`
  z-index: 2;
  margin-left: 10px;
  img {
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.53);
    &:first-child {
      margin-top: 0;
    }
    display: block;
    margin: 10px 0;
    height: 135px;
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const HeroAssetLabel = styled(LocaleString)`
  text-align: center;
  color: #fff;
  font-weight: 600;
  font-size: 1.4em;
  white-space: nowrap;
  text-overflow: ellipsis;
  margin: 0 2em;
`;

const HeroAssetAttribution = styled(LocaleString)`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  font-size: 0.85em;
  a {
    color: #fff;
  }
`;

const HeroContent = styled.div<{ $noAsset?: boolean }>`
  z-index: 2;
  flex: 1 1 0px;
  align-self: center;
  padding: 3em 6em 3em 10em;
  max-width: 600px;
  margin-right: auto;

  ${props =>
    props.$noAsset &&
    css`
      max-width: 900px;
    `}
`;

const HeroTitle = styled(LocaleString)`
  display: block;
  font-size: 3.8em;
  font-weight: 600;
`;

const HeroDescription = styled(LocaleString)`
  display: block;
  font-size: 1.4em;
  font-weight: 600;
`;

const HeroButton = styled(Button).attrs({ $primary: true })`
  margin-top: 1em;
  font-size: 1.4em;
  padding: 0.5em 2em;
`;

export const IIIFHero = (props: IIIFHeroProps) => {
  const bigImage = useRef<HTMLImageElement>(null);

  return (
    <HeroContainer $noAsset={!props.asset}>
      <HeroContent $noAsset={!props.asset}>
        <HeroTitle>{props.title}</HeroTitle>
        <HeroDescription>{props.description}</HeroDescription>
        {props.button ? (
          <HeroButton as={props.button.isExternal ? 'a' : HrefLink} href={props.button.link}>
            <LocaleString>{props.button.title}</LocaleString>
          </HeroButton>
        ) : null}
      </HeroContent>
      {props.asset ? (
        <HeroAssetContainer
          as={props.asset.link ? HrefLink : undefined}
          href={props.asset.link}
          style={{ backgroundColor: props.asset.backgroundColor || '#342145' }}
        >
          <HeroAssetThumbnails $background={props.asset.backgroundColor || '#342145'}>
            <HeroAssetLargeThumbnail>
              <img src={props.asset.thumbnails[0]} alt="" ref={bigImage} />
            </HeroAssetLargeThumbnail>
            <HeroAssetThumbnail>
              <img src={props.asset.thumbnails[1]} alt="" />
              <img src={props.asset.thumbnails[2]} alt="" />
            </HeroAssetThumbnail>
            <HeroAssetThumbnail style={{ opacity: 0.5 }}>
              <img src={props.asset.thumbnails[3]} alt="" />
              <img src={props.asset.thumbnails[4]} alt="" />
            </HeroAssetThumbnail>
            <HeroAssetThumbnail style={{ opacity: 0.5 }}>
              <img src={props.asset.thumbnails[3]} alt="" />
              <img src={props.asset.thumbnails[4]} alt="" />
            </HeroAssetThumbnail>
          </HeroAssetThumbnails>
          <HeroAssetLabel>{props.asset.label}</HeroAssetLabel>
          <HeroAssetAttribution enableDangerouslySetInnerHTML>{props.asset.attribution}</HeroAssetAttribution>
        </HeroAssetContainer>
      ) : null}
      <HeroBackground
        $image={props.backgroundImage ? props.backgroundImage : props.asset ? props.asset?.thumbnails[0] : ''}
      />
    </HeroContainer>
  );
};
