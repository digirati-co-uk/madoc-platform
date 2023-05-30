import React, { useState } from 'react';
import styled from 'styled-components';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-for';
import { GlobalSiteNavigation } from './GlobalSiteNavigation';
import { CloseIcon } from '../../shared/icons/CloseIcon';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useBrowserLayoutEffect } from '../../shared/hooks/use-browser-layout-effect';

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
  transition: all 0.5s;
  left: 0;
  right: 0;
  background-color: #002d4b;
  z-index: 11;

  padding: 0 5em;

  display: flex;
  justify-content: space-evenly;
  align-content: start;

  &[data-is-open='true'] {
    padding: 5em;
    transition: all 0.5s;
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
  extraLinks?: {
    slug?: string;
    text?: string;
  }[];
}> = ({ showHomepageMenu, extraLinks }) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation();

  const location = useLocation();
  useBrowserLayoutEffect(() => {
    setOpen(false);
  }, [location]);

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
            <GlobalSiteNavigation showHomepageMenu={showHomepageMenu} extraNavItems={extraLinks} />
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
  label: 'Dropdown menu',
  requiredContext: ['page'],
  defaultProps: {
    showHomepageMenu: false,
    extraLinks: [
      {
        slug: '',
        text: '',
      },
    ],
  },
  editor: {
    showHomepageMenu: {
      label: 'Homepage menu',
      type: 'checkbox-field',
      inlineLabel: 'Show home as menu item',
    },
    extraLinks: {
      allowMultiple: true,
      label: 'Extra Nav items',
      pluralLabel: 'Extra Nav items',
      labelledBy: 'text',
      description: 'paste the relative slug as shown on the site eg: projects/project-name',
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    'extraLinks.text': {
      type: 'text-field',
      label: 'Extra Nav item display text',
    },
    'extraLinks.slug': {
      type: 'text-field',
      label: 'Extra Nav item slug',
      description: 'paste the relative slug as shown on the site eg: topics/topic_type/topic',
    },
    slug1: {
      type: 'text-field',
      label: 'Extra Nav item slug',
      description: 'paste the relative slug as shown on the site eg: topics/topic_type/topic',
    },
  },
  source: {
    id: 'global-header',
    type: 'global',
    name: 'Global header',
  },
});
