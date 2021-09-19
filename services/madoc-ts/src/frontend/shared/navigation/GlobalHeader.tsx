import React from 'react';
import styled, { css } from 'styled-components';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';

const GlobalHeaderContainer = styled.div`
  background: #2f3338;
  display: flex;
  padding: 0.5em 1em;
  align-items: center;
`;

const GlobalHeaderTitle = styled.div`
  margin-right: auto;
  color: #fff;
`;

export const GlobalHeaderMenuContainer = styled.div`
  position: relative;
`;

export const GlobalHeaderMenuItem = styled.a`
  display: block;
  color: #fff;
  text-decoration: none;
  padding: 0.4em 0.75em;
  &:hover,
  &:focus {
    outline: none;
    background: #626971;
    border-radius: 3px;
  }
`;

export const GlobalHeaderMenuLabel = styled.button`
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1em;
  border-top: 2px solid transparent;
  border-bottom: 2px solid transparent;
  &:focus {
    color: rgba(255, 255, 255, 1);
    border-bottom: 2px solid dodgerblue;
    outline: none;
  }
`;

export const GlobalHeaderMenuList = styled.div<{ $visible?: boolean }>`
  position: absolute;
  background: #2f3338;
  display: none;
  padding: 0.3em;
  right: 0;
  top: 1.8em;
  font-size: 0.9em;
  min-width: 10.5em;
  ${props =>
    props.$visible &&
    css`
      display: block;
    `}
`;

export const GlobalHeader: React.FC<{
  title: string;
  links: Array<{ link: string; label: string }>;
  username: string;
}> = ({ username, title, links }) => {
  const { buttonProps, itemProps, isOpen } = useDropdownMenu(links.length);

  return (
    <GlobalHeaderContainer>
      <GlobalHeaderTitle>{title}</GlobalHeaderTitle>
      <GlobalHeaderMenuContainer>
        <GlobalHeaderMenuLabel {...buttonProps}>{username}</GlobalHeaderMenuLabel>
        <GlobalHeaderMenuList $visible={isOpen} role="menu">
          {links.map((link, i) => (
            <GlobalHeaderMenuItem key={i} href={link.link} {...itemProps[i]}>
              {link.label}
            </GlobalHeaderMenuItem>
          ))}
        </GlobalHeaderMenuList>
      </GlobalHeaderMenuContainer>
    </GlobalHeaderContainer>
  );
};
