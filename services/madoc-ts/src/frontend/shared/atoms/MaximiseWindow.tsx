import * as React from 'react';
import { useCallback, useMemo, useState } from 'react';
import styled, { css } from 'styled-components';

const MaximiseWindowContainer = styled.div<{ $open: boolean }>`
  height: 100%;
  background: #fff;
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
  children: (vars: { toggle: () => void; isOpen: boolean }) => React.ReactNode;
}> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => {
    setIsOpen(i => !i);
  }, []);

  return (
    <MaximiseWindowContainer $open={isOpen}>
      {children(useMemo(() => ({ toggle, isOpen }), [isOpen, toggle]))}
    </MaximiseWindowContainer>
  );
};
