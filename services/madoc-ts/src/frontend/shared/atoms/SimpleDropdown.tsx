import styled, { css } from 'styled-components';
import * as React from 'react';
import { Button, ButtonIcon } from '../navigation/Button';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

const SimpleDropDownContainer = styled.div`
  position: relative;
  max-width: 150px;
  align-self: end;
  z-index: 11;
`;

const SimpleDropdownMenu = styled.div<{ $visible?: boolean }>`
  background: #ffffff;
  border: 1px solid #3498db;
  z-index: 11;
  border-radius: 4px;
  position: absolute;
  display: none;
  margin: 0.3em;
  top: 2.6em;
  right: 0;
  font-size: 0.9em;
  min-width: 10em;
  ${props =>
    props.$visible &&
    css`
      display: flex;
      flex-direction: column;
    `}
`;

interface SimpleDropdownProps {
  children: React.ReactNode;
  buttonText?: string | React.ReactNode;
}
export const SimpleDropdown = ({ buttonText, children }: SimpleDropdownProps) => {
  const { buttonProps, isOpen: isDropdownOpen } = useDropdownMenu(1, {
    disableFocusFirstItemOnClick: true,
  });

  return (
    <SimpleDropDownContainer>
      <Button $link {...buttonProps}>
        {buttonText}
      </Button>
      <SimpleDropdownMenu $visible={isDropdownOpen} role="menu">
        <>{children}</>
      </SimpleDropdownMenu>
    </SimpleDropDownContainer>
  );
};
