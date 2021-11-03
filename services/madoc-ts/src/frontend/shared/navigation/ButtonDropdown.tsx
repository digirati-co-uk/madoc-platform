import React, { ComponentProps, JSXElementConstructor, PropsWithChildren } from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import styled, { css } from 'styled-components';

const ButtonDropdownContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const ButtonDropdownPopupContainer = styled.div<{ $visible?: boolean }>`
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 3px 8px 0 rgba(0, 0, 0, 0.14);
  border-radius: 4px;
  color: #000;

  position: absolute;
  display: none;
  padding: 0.3em;
  right: 0;
  top: 2.8em;
  font-size: 0.9em;
  min-width: 10em;
  ${props =>
    props.$visible &&
    css`
      display: block;
    `}
`;

export const ButtonDropdownDefaultItem = styled.div`
  display: block;
  color: #000;
  text-decoration: none;
  padding: 0.4em 0.75em;
  cursor: pointer;
  &:hover,
  &:focus {
    outline: none;
  }
`;

type ButtonDropdownItem = {
  render: () => any;
  onClick: () => void;
};

export function ButtonDropdown<
  Comp extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
  ExtraProps extends ComponentProps<Comp>
>({
  as: Component,
  items,
  children,
  ...props
}: PropsWithChildren<{ as: Comp; items: Array<ButtonDropdownItem> } & ExtraProps>) {
  const { buttonProps, itemProps, isOpen, setIsOpen } = useDropdownMenu(items.length, {
    disableFocusFirstItemOnClick: items.length === 0,
  });

  return (
    <ButtonDropdownContainer>
      <Component {...props} {...buttonProps}>
        {children}
      </Component>
      <ButtonDropdownPopupContainer $visible={isOpen} role="menu">
        {items.map((item: ButtonDropdownItem, n: number) => {
          return (
            <div
              key={n}
              onClick={() => {
                setIsOpen(false);
                item.onClick();
              }}
              {...(itemProps[n] as any)}
            >
              {item.render()}
            </div>
          );
        })}
      </ButtonDropdownPopupContainer>
    </ButtonDropdownContainer>
  );
}
