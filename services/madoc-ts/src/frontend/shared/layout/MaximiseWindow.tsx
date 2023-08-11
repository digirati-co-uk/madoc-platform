import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

export const MaximiseWindowContainer = styled.div<{ $open: boolean }>`
  height: 100%;
  background: #fff;
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  ${props =>
    props.$open &&
    css`
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: 22;
      overflow-y: scroll;
      overscroll-behavior-y: contain;
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
  }, [isOpen, onChange]);

  return (
    <MaximiseWindowContainer $open={isOpen} data-open={isOpen}>
      {children(useMemo(() => ({ toggle, isOpen }), [isOpen, toggle]))}
    </MaximiseWindowContainer>
  );
};
