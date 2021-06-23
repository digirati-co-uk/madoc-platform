import {
  ContextualLabel,
  ContextualMenuList,
  ContextualMenuListItem,
  ContextualMenuWrapper,
  ContextualPositionWrapper,
} from '../src/frontend/shared/atoms/ContextualMenu';
import { ModalButton } from '../src/frontend/shared/components/Modal';
import * as React from 'react';
import useDropdownMenu from 'react-accessible-dropdown-menu-hook';
import { SettingsIcon } from '../src/frontend/shared/icons/SettingsIcon';

export default { title: 'Contextual menu' };

export const Default_Contextual = () => {
  const { isOpen, buttonProps, itemProps } = useDropdownMenu(9);

  return (
    <>
      <ContextualPositionWrapper>
        <ContextualLabel {...buttonProps}>
          <SettingsIcon /> settings
        </ContextualLabel>
        <ContextualMenuWrapper $padding $isOpen={isOpen}>
          <ContextualMenuList>
            <ModalButton as={ContextualMenuListItem} {...itemProps[0]} title="Test" render={() => <div>Test</div>}>
              Do thing a
            </ModalButton>
            <ContextualMenuListItem {...itemProps[1]}>Do thing b</ContextualMenuListItem>
            <ContextualMenuListItem {...itemProps[2]}>Do thing c</ContextualMenuListItem>
          </ContextualMenuList>

          <ContextualMenuList>
            <ContextualMenuListItem {...itemProps[3]}>Do Thing a</ContextualMenuListItem>
            <ContextualMenuListItem {...itemProps[4]}>Do Thing b</ContextualMenuListItem>
            <ContextualMenuListItem {...itemProps[5]}>Do Thing c</ContextualMenuListItem>
          </ContextualMenuList>

          <ContextualMenuList>
            <ContextualMenuListItem {...itemProps[6]}>Do Thing a</ContextualMenuListItem>
            <ContextualMenuListItem {...itemProps[7]}>Do Thing b</ContextualMenuListItem>
            <ContextualMenuListItem {...itemProps[8]}>Do Thing c</ContextualMenuListItem>
          </ContextualMenuList>
        </ContextualMenuWrapper>
      </ContextualPositionWrapper>

      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </>
  );
};
