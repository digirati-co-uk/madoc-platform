import React from 'react';
import styled, { css } from 'styled-components';
import { ConfirmButton } from '../../atoms/ConfirmButton';
import { getCard, getTheme } from '../../themes';

export type CardSize = 'large' | 'medium' | 'small';

export type RoundedCardProps = {
  size?: CardSize;
  count?: number;
  label?: string;
  labelFor?: string;
  image?: string;
  interactive?: boolean;
  onClick?: any;
  onRemove?: () => void;
  removeMessage?: string;
};

const CardLabel = styled.label`
  display: block;
  font-size: ${props => getTheme(props).sizes.headingMd};
  color: #000;
  flex: 1 1 0px;
  align-self: center;
`;

const CardBody = styled.div`
  font-size: ${props => getTheme(props).sizes.text};
  line-height: 1.4em;
  color: #000;
`;

const CardWrapper = styled.article<{ size: CardSize; interactive: boolean }>`
  position: relative;
  box-sizing: border-box;
  background: #fff;
  padding: ${props => getCard(props, 'padding')};
  border-radius: ${props => getCard(props, 'radius')};
  margin-bottom: ${props => getCard(props, 'margin')};
  box-shadow: ${props => getTheme(props).card.shadow};
  border: 2px solid transparent;
  z-index: 2;
  ${props =>
    props.interactive &&
    css`
      cursor: pointer;
      & label {
        cursor: pointer;
      }
    `}
  &:hover {
    border: 2px solid ${props => (props.interactive ? getTheme(props).colors.primary : 'transparent')};
  }
`;

const DeleteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
);

const CardCount = styled.div`
  background: ${props => getTheme(props).colors.mutedPrimary};
  color: ${props => getTheme(props).colors.textOnMutedPrimary};
  border-radius: 12px;
  border: 1px solid ${props => getTheme(props).colors.textOnMutedPrimary};
  font-size: 12px;
  padding: 0 8px;
  font-weight: 600;
  height: 24px;
  line-height: 24px;
  align-self: center;
`;

const CardLayout = styled.div<{ showMargin: boolean }>`
  display: flex;
  flex-direction: row;
  margin-bottom: ${props => (props.showMargin ? '0.6em' : '0')};
`;

const CardImage = styled.img`
  height: 30px;
  width: 30px;
  contain: content;
  margin-right: 10px;
`;

const RemoveIcon = styled.div<{ size: CardSize }>`
  position: absolute;
  ${props =>
    props.size === 'small'
      ? css`
          top: 0.4em;
          right: 0.4em;
        `
      : css`
          top: 1em;
          right: 1em;
        `};
  width: 30px;
  height: 30px;
  text-align: center;
  display: flex;
  align-content: center;
  justify-content: center;
  border-radius: 50%;
  svg {
    margin: auto;
  }
  box-shadow: none;
  transition: box-shadow 0.4s, background-color 0.4s;
  &:hover {
    background: #ffac9d;
    box-shadow: 0px 4px 10px 0 rgba(0, 0, 0, 0.3);
  }
`;

export const RoundedCard: React.FC<RoundedCardProps> = ({
  size = 'large',
  onClick,
  onRemove,
  removeMessage,
  count,
  label,
  labelFor,
  interactive = !!onClick,
  children,
  image,
}) => {
  return (
    <CardWrapper interactive={interactive} size={size} onClick={onClick}>
      {onRemove ? (
        <ConfirmButton
          defaultButton
          message={removeMessage ? removeMessage : 'Are you sure you want to remove this?'}
          onClick={() => {
            onRemove();
          }}
        >
          <RemoveIcon size={size}>
            <DeleteIcon />
          </RemoveIcon>
        </ConfirmButton>
      ) : null}
      {image || label || count ? (
        <CardLayout showMargin={!!children}>
          {image ? <CardImage src={image} /> : null}
          {label ? <CardLabel htmlFor={labelFor}>{label}</CardLabel> : null}
          {count ? <CardCount>{count}</CardCount> : null}
        </CardLayout>
      ) : null}
      {children ? <CardBody>{children}</CardBody> : null}
    </CardWrapper>
  );
};
