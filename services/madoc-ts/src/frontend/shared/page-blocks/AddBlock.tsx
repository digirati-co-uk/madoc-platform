import React from 'react';
import styled from 'styled-components';

export const AddBlockContainer = styled.div<{ $active?: boolean }>`
  position: relative;
  background: #fff;
  border: 1px solid #cccccc;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.18);
  border-radius: 3px;
  padding: 1em;
  width: 200px;
  height: 230px;
  cursor: pointer;
  &:hover {
    border-color: #4268ed;
  }
`;

export const AddBlockList = styled.div`
  display: grid; /* 1 */
  grid-template-columns: repeat(auto-fill, 200px); /* 2 */
  grid-gap: 1.5rem; /* 3 */
  justify-content: space-evenly; /* 4 */
  padding: 1.5em 0;
`;

export const AddBlockIconWrapper = styled.div`
  max-width: 100%;
  height: 140px;
  background: #fff;
  padding: 1em 0.5em;
  display: flex;
  justify-content: space-between;
  svg {
    width: 100%;
    height: auto;
  }
`;

export const AddBlockLabel = styled.div`
  color: #000;
  font-size: 0.8em;
  font-weight: bold;
  text-align: center;
  margin: 0.3em 0;
`;

export const AddBlockPluginName = styled.div`
  color: #666;
  text-align: center;
  font-size: 0.8em;
`;

export const DefaultBlockIcon: React.FC<React.SVGProps<SVGSVGElement>> = props => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 385.419 385.419" {...props}>
      <path
        fill="#D1D8E8"
        d="M188.998 331.298l-.231-107.449-92.494-53.907-92.327 53.712.225 108.29 92.102 53.475 92.725-54.121zm-83.342 26.994l.165-75.232 64.289-37.558.165 75.067-64.619 37.723zM96.26 191.586l64.603 37.658-64.384 37.606-64.605-37.8 64.386-37.464zm-73.557 53.77l64.411 37.691-.164 75.335-64.092-37.217-.155-75.809zM288.748 169.948l-92.324 53.706.231 108.29 92.104 53.475 92.714-54.121-.231-107.449-92.494-53.901zm-.013 21.638l64.605 37.658-64.386 37.606-64.606-37.801 64.387-37.463zm-73.556 53.77l64.404 37.691-.164 75.335-64.076-37.217-.164-75.809zm82.958 112.936l.159-75.232 64.289-37.558.164 75.067-64.612 37.723zM285.216 53.892L192.719 0l-92.324 53.697.222 108.295 92.102 53.479 92.717-54.121-.22-107.458zm-92.509-32.257l64.609 37.649-64.384 37.619-64.609-37.811 64.384-37.457zm-73.558 53.766l64.411 37.698-.161 75.335-64.095-37.211-.155-75.822zm82.95 112.942l.162-75.234 64.292-37.564.164 75.073-64.618 37.725z"
      />
    </svg>
  );
};

export const AddBlockAdded = styled.div`
  background: #4268ed;
  position: absolute;
  top: 5px;
  right: 0;
  font-size: 0.8em;
  color: #fff;
  padding: 0.4em;
`;

export const BlockCreatorPreview = styled.div`
  display: flex; // so it displays the same as when on page
  margin: 1em 0;
  width: 100%;
  min-height: 200px;
  border: 3px solid #f2f2f2;
`;