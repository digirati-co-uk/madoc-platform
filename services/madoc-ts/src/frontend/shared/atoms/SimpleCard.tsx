import React from 'react';
import styled, { css } from 'styled-components';
import { ArrowForwardIcon } from '../icons/ArrowForwardIcon';

export type SimpleCardProps = {
  label?: string | React.ReactNode;
  labelFor?: string;
  image?: string;
  interactive?: boolean;
  onClick?: any;
  children?: React.ReactNode;
};

const CardLabel = styled.label`
  display: block;
  font-size: 1.3em;
  color: #000;
  flex: 1 1 0px;
  align-self: center;
`;

const CardBody = styled.div`
  font-size: 1em;
  line-height: 1.4em;
  color: #000;
`;

const CardIcon = styled.div`
  font-size: 1.5em;
  align-self: center;
`;

const CardWrapper = styled.article<{ interactive?: boolean }>`
  margin: 0 0 1.5em 0;
  border: 2px solid rgba(0, 0, 0, 0.15);
  border-radius: 5px;

  position: relative;
  box-sizing: border-box;
  padding: 1em;
  background: #fff;
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
    border: 2px solid ${props => (props.interactive ? '#3579f6' : 'transparent')};
  }
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

export const SimpleCard: React.FC<SimpleCardProps> = ({
  onClick,
  label,
  labelFor,
  interactive = !!onClick,
  children,
  image,
}) => {
  return (
    <CardWrapper interactive={interactive} onClick={onClick}>
      {image || label ? (
        <CardLayout showMargin={!!children}>
          {image ? <CardImage src={image} /> : null}
          {label ? <CardLabel htmlFor={labelFor}>{label}</CardLabel> : null}
          <CardIcon>
            <ArrowForwardIcon />
          </CardIcon>
        </CardLayout>
      ) : null}
      {children ? <CardBody>{children}</CardBody> : null}
    </CardWrapper>
  );
};
