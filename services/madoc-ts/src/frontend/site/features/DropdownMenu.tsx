import React, { useState } from 'react';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { GlobalSiteNavigation } from './GlobalSiteNavigation';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { ChevronDown } from '../../shared/icons/ChevronIcon';
import { HrefLink } from '../../shared/utility/href-link';
import { useTranslation } from 'react-i18next';

const DropdownMenuWrapper = styled.div``;

const MenuButton = styled.button`
  background-color: transparent;
  border: none;
  color: white;
  font-weight: 500;
  font-size: 16px;
  padding: 1em;
  margin: 0 1em;

  border-bottom: 5px solid transparent;
  transition: border-bottom-color 0.5s;

  :hover {
    border-color: #b1e0ff;
  }
  &[data-is-open='true'] {
    border-color: #b1e0ff;
    transition: border-bottom-color 0.5s;
    :hover {
      border-color: white;
    }
  }
`;

const DropdownContainer = styled.div`
  height: 0;
  overflow: hidden;
  position: absolute;
  transition: all 0.7s;
  left: 0;
  right: 0;
  background-color: #002d4b;
  z-index: 999;

  padding: 0 5em;

  display: flex;
  justify-content: space-evenly;
  align-content: start;

  &[data-is-open='true'] {
    padding: 5em;
    transition: all 0.7s;
    height: 100vh;
  }
`;
const NavHeader = styled.div`
  color: white;
  font-size: 48px;
  font-weight: 600;
  padding-bottom: 0.5em;
`;
const NavWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const CloseBtn = styled.button`
  align-self: start;
  border: none;
  background-color: transparent;
  font-size: 18px;
  font-weight: 300;
  color: white;
  :hover {
    svg {
      fill: white;
    }
  }
  svg {
    fill: #b1e0ff;
    vertical-align: middle;
    margin-right: 0.5em;
  }
`;

const MenuItemHeader = styled.div`
  font-size: 18px;
  font-weight: 400;
  color: white;
  text-decoration: none;
  margin: 0.5em 0;
  svg {
    fill: #ffffff;
    vertical-align: middle;
    margin-right: 0.5em;
    transform: rotateX(180deg);

    :hover {
      fill: #b1e0ff;
    }

    &[data-is-item-open='true'] {
      fill: #b1e0ff;
      transform: rotateX(0deg);
      :hover {
        fill: white;
      }
    }
  }
`;

const MenuItemWrapper = styled.div`
  height: 0;
  overflow: hidden;
  transition: height 0.5s;
  margin: 0.5em;

  &[data-is-item-open='true'] {
    transition: height 0.5s;
    height: 100px;
  }
  a {
    color: #b1e0ff;
    font-size: 18px;
    font-weight: 300;
    padding: 1em;
  }
`;
export const DropDownMenu: React.FC<{
  showHomepageMenu?: boolean;
}> = ({ showHomepageMenu }) => {
  const [open, setOpen] = useState(false);
  const [itemOpen, setItemOpen] = useState(false);
  const { t } = useTranslation();
  return (
    <DropdownMenuWrapper>
      <MenuButton
        data-is-open={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        Menu
      </MenuButton>

      <DropdownContainer data-is-open={open}>
        <div>
          <NavHeader>Menu</NavHeader>

          <NavWrapper>
            <MenuItemHeader
              onClick={() => {
                setItemOpen(!itemOpen);
              }}
            >
              <ChevronDown data-is-item-open={itemOpen} /> Something
            </MenuItemHeader>

            <MenuItemWrapper data-is-item-open={itemOpen}>
              <a>something</a>
            </MenuItemWrapper>

            <MenuItemHeader as={HrefLink} href="/">
              {t('Home')}
            </MenuItemHeader>
            <MenuItemHeader as={HrefLink} href="/">
              {t('Home')}
            </MenuItemHeader>
            <MenuItemHeader as={HrefLink} href="/">
              {t('Home')}
            </MenuItemHeader>

            {/*<GlobalSiteNavigation showHomepageMenu={showHomepageMenu} />*/}
          </NavWrapper>
        </div>
        <CloseBtn
          onClick={() => {
            setOpen(!open);
          }}
        >
          <CloseIcon />
          Close
        </CloseBtn>
      </DropdownContainer>
    </DropdownMenuWrapper>
  );
};

blockEditorFor(DropDownMenu, {
  type: 'default.DropDownMenu',
  label: 'Dropdown menu)',
  defaultProps: {
    showHomepageMenu: false,
  },
  editor: {
    showHomepageMenu: {
      label: 'Homepage menu',
      type: 'checkbox-field',
      inlineLabel: 'Show home as menu item',
    },
  },
});
