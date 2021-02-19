import React from 'react';
import styled, { css } from 'styled-components';

const PanelHeader = styled.div<{ $active?: boolean }>`
  max-width: 200px;
  overflow: hidden;
  font-size: 14px;
  padding: 1rem;
  color: #000000;
  ${props =>
    props.$active &&
    css`
      color: #6200ee;
      border-bottom: 2px solid #6200ee;
    `};
`;

const TabPanelOptions = styled.div`
  display: flex;
  background-color: #fff;
  border: 0.05px solid #f8f9fa;
`;

const TabPanelContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
`;

export const TabPanel: React.FC<{ menu: any; switchPanel: (idx: number) => void; selected: number; style?: any }> = ({
  menu,
  switchPanel,
  selected,
  style,
}) => {
  return (
    <TabPanelContainer style={style}>
      <TabPanelOptions>
        {menu.map((item: any, idx: number) => {
          return (
            <PanelHeader key={idx} $active={idx === selected} onClick={() => switchPanel(idx)}>
              {item.label}
            </PanelHeader>
          );
        })}
      </TabPanelOptions>
      {menu[selected].component}
    </TabPanelContainer>
  );
};
