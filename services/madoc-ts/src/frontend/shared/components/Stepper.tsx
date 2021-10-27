import * as React from 'react';
import styled, { css } from 'styled-components';
import { CloseIcon } from '../icons/CloseIcon';
import { WhiteTickIcon } from '../icons/TickIcon';

const StepContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

export const StepperContainer = styled.div`
  position: relative;

  ${StepContainer}:last-child {
    position: relative;
    &:after {
      content: '';
      width: 2px;
      position: absolute;
      top: 1.5em;
      bottom: -1.5em;
      left: calc(2em - 1px);
      background: #fff;
      z-index: 2;
    }
  }
`;

const StepIconContainer = styled.div<{ $status: 'todo' | 'progress' | 'done' | 'error' }>`
  margin-top: 0.5em;
  width: 4em;
  position: relative;

  &:before {
    content: '';
    width: 2px;
    position: absolute;
    top: 1em;
    bottom: -1.5em;
    left: calc(2em - 1px);
    background: ${props => (props.$status === 'done' ? '#5a78e8' : '#D3D8E7')};
    z-index: 2;
  }
`;

const StepIcon = styled.div<{ $status: 'todo' | 'progress' | 'done' | 'error' }>`
  margin: 0 auto;
  border-radius: 50%;
  position: relative;
  z-index: 3;
  box-shadow: 0 0 0 2px #fff;

  svg {
    fill: #fff;
    height: 0.7em;
    vertical-align: text-bottom;
  }

  ${props => {
    switch (props.$status) {
      case 'done': {
        return css`
          background: #5a78e8;
          height: 1.5em;
          width: 1.5em;
        `;
      }
      case 'error': {
        return css`
          background: #c74158;
          height: 1.5em;
          width: 1.5em;
        `;
      }
      case 'progress': {
        return css`
          background: #5a78e8;
          margin-top: 0.375em;
          height: 0.75em;
          width: 0.75em;
        `;
      }
      default:
      case 'todo': {
        return css`
          background: #d3d8e7;
          margin-top: 0.375em;
          height: 0.75em;
          width: 0.75em;
        `;
      }
    }
  }}
`;

const StepMetadata = styled.div`
  flex: 1 1 0px;
  margin-bottom: 2em;
`;

const StepTitle = styled.h2<{ $inactive?: boolean }>`
  margin: 0;
  font-weight: normal;
  font-size: 1.4em;
  ${props =>
    props.$inactive &&
    css`
      color: #999;
    `}
`;

const StepDescription = styled.div`
  font-size: 0.8em;
  color: #666;
`;

const StepContent = styled.div<{ $open?: boolean }>`
  min-width: 100%;
  max-height: 0;
  overflow: hidden;

  ${props =>
    props.$open &&
    css`
      overflow: initial;
      max-height: 1000px;
      height: auto;
    `}
`;

const StepContentInner = styled.div`
  padding: 1em 0;
`;

export const Stepper: React.FC<{
  status: 'todo' | 'progress' | 'done' | 'error';
  title: string;
  description: string;
  onClickDescription?: () => void;
  open?: boolean;
}> = ({ title, onClickDescription, description, status, open, children }) => {
  return (
    <StepContainer>
      <StepIconContainer $status={status}>
        <StepIcon $status={status}>
          {status === 'done' ? <WhiteTickIcon /> : null}
          {status === 'error' ? <CloseIcon /> : null}
        </StepIcon>
      </StepIconContainer>

      <StepMetadata>
        <StepTitle>{title}</StepTitle>
        <StepDescription onClick={onClickDescription}>{description}</StepDescription>
        <StepContent $open={open}>
          <StepContentInner>{children}</StepContentInner>
        </StepContent>
      </StepMetadata>
    </StepContainer>
  );
};
