import React, { useState } from 'react';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { GlobalSiteNavigation } from './GlobalSiteNavigation';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

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

  ul {
    display: flex;
    flex-direction: column;
  }

  li {
    font-size: 18px;
    font-weight: 400;
    color: white;
    text-decoration: none;
    margin: 0.5em 0;
  }
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
      transform: rotatez(180deg);
      transition: 0.8s;
    }
  }
  svg {
    transform: rotatez(0deg);
    transition: 0.8s;
    fill: #b1e0ff;
    vertical-align: middle;
    margin-right: 0.5em;
  }
`;
export const DropDownMenu: React.FC<{
  showHomepageMenu?: boolean;
  newNavItems?: {
    slug?: string;
    text?: string;
  }[];
}> = ({ showHomepageMenu, newNavItems }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();
  const location = useLocation();
  return (
    <DropdownMenuWrapper>
      <MenuButton
        data-is-open={open}
        onClick={() => {
          setOpen(!open);
        }}
      >
        {t('Menu')}
      </MenuButton>

      <DropdownContainer data-is-open={open}>
        <div>
          <NavHeader>{t('Menu')}</NavHeader>

          <NavWrapper>
            <GlobalSiteNavigation showHomepageMenu={showHomepageMenu} extraNavItems={newNavItems} />
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
    slug1: '',
    text1: '',
    slug2: '',
    text2: '',
    slug3: '',
    text3: '',
  },
  editor: {
    showHomepageMenu: {
      label: 'Homepage menu',
      type: 'checkbox-field',
      inlineLabel: 'Show home as menu item',
    },
    slug1: {
      type: 'text-field',
      label: 'Extra Nav item slug',
      description: 'paste the relative slug as shown on the site eg: topics/topic_type/topic',
    },
    text1: { type: 'text-field', label: 'Extra Nav item display text' },
    slug2: { type: 'text-field', label: 'Extra Nav item slug' },
    text2: { type: 'text-field', label: 'Extra Nav item display text' },
    slug3: { type: 'text-field', label: 'Extra Nav item slug' },
    text3: { type: 'text-field', label: 'Extra Nav item display text' },
  },
  mapToProps(formInput: any) {
    const newNavItems: {
      slug?: string;
      text?: string;
    }[] = [];
    if (formInput.slug1) newNavItems.push({ slug: formInput.slug1, text: formInput.text1 });
    if (formInput.slug2) newNavItems.push({ slug: formInput.slug2, text: formInput.text2 });
    if (formInput.slug3) newNavItems.push({ slug: formInput.slug3, text: formInput.text3 });
    return { newNavItems };
  },
});
