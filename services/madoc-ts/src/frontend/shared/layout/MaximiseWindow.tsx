import * as React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styledComponents, { css } from 'styled-components';

export const MaximiseWindowContainer = styledComponents.div<{ $open: boolean; $openZIndex?: number }>`
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
      z-index: ${props.$openZIndex ?? 22};
      overflow-y: scroll;
      overscroll-behavior-y: contain;
    `}
`;

export const MaximiseWindow: React.FC<{
  onChange?: (isOpen: boolean) => void;
  openZIndex?: number;
  children: (vars: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
}> = ({ children, onChange, openZIndex }) => {
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
    <MaximiseWindowContainer $open={isOpen} $openZIndex={openZIndex} data-open={isOpen}>
      {children(useMemo(() => ({ toggle, isOpen }), [isOpen, toggle]))}
    </MaximiseWindowContainer>
  );
};
