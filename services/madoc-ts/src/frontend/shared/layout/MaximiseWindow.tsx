import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const MaximiseWindowContainer = styled.div<{ $open: boolean }>`
  height: 100%;
  background: #fff;
  flex: 1 1 0px;
  min-height: 0;
  min-width: 0;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  ${props =>
    props.$open &&
    css`
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 11;
    `}
`;

export const MaximiseWindow: React.FC<{
  onChange?: (isOpen: boolean) => void;
  children: (vars: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
}> = ({ children, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen(i => !i);
  }, []);

  useEffect(() => {
    if (onChange) {
      onChange(isOpen);
    }
  }, [isOpen]);

  return (
    <MaximiseWindowContainer $open={isOpen}>
      {children(useMemo(() => ({ toggle, isOpen }), [isOpen, toggle]))}
    </MaximiseWindowContainer>
  );
};
