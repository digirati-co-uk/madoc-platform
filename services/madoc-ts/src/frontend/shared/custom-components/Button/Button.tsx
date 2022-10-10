import * as React from 'react';
import { Btn, TxtBtn } from './Button.style';

export type ButtonProps = {
  color?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  ariaLabel?: string;
};

export const Button = (props: ButtonProps) => (
  <Btn aria-label={props.ariaLabel} color={props.color}>
    {props.children}
  </Btn>
);
export const TextButton = (props: ButtonProps) => (
  <TxtBtn aria-label={props.ariaLabel} color={props.color}>
    {props.children}
  </TxtBtn>
);
