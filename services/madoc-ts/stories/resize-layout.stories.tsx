import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import * as React from 'react';
// @ts-ignore
import MultiBackend from 'react-dnd-multi-backend';
// @ts-ignore
import HTML5toTouch from 'react-dnd-multi-backend/dist/cjs/HTML5toTouch';
import { DndProvider, useDrag } from 'react-dnd';
import styled, { css } from 'styled-components';
import { useLocalStorage } from '../src/frontend/shared/hooks/use-local-storage';

export default { title: 'Resize layout' };

const SomeDiv = styled.div`
  width: 500px;
  height: 500px;
  background: red;
`;

const SomeHandle = styled.div<{ $isDragging?: boolean }>`
  width: 10px;
  background: #eee;
  height: 500px;
  user-select: none;
  cursor: col-resize;
  &:hover,
  &:active {
    background: #ddd;
  }

  ${props =>
    props.$isDragging &&
    css`
      &,
      &:active,
      &:hover {
        background-color: blue;
      }
    `}
`;

function useEvHandler(ref: any, name: string, callback: (e: any) => void, deps: any[] = []) {
  useLayoutEffect(() => {
    const current = ref.current;
    current.addEventListener(name, callback);

    return () => {
      current.removeEventListener(name, callback);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, ...deps]);
}

function useResizeThing(name: string, options: { widthA?: any; widthB?: any } = {}) {
  const container = useRef<HTMLDivElement>();
  const resizableDiv = useRef<HTMLDivElement>();
  const resizer = useRef<HTMLDivElement>();
  const newPct = useRef(0.5);
  const [isDragging, setIsDragging] = useState(false);
  const [{ widthA, widthB }, setWidths] = useLocalStorage(`resize-grid/${name}`, {
    widthA: options.widthA || '50%',
    widthB: options.widthB || '50%',
  });

  useEvHandler(resizer, 'mousedown', () => {
    setIsDragging(true);
  });

  useEvHandler({ current: window }, 'mouseup', () => {
    setWidths({
      widthA: `${(1 - newPct.current) * 100}%`,
      widthB: `${newPct.current * 100}%`,
    });
    setIsDragging(false);
  });

  useEvHandler(
    container,
    'mousemove',
    e => {
      if (isDragging && resizableDiv.current) {
        const { x, width } = container.current.getBoundingClientRect();

        newPct.current = (width + x - e.pageX - 5) / width;
        newPct.current = newPct.current < 0.2 ? 0.2 : newPct.current;
        newPct.current = newPct.current > 0.8 ? 0.8 : newPct.current;

        resizableDiv.current.style.width = `${newPct.current * 100}%`;
      }
    },
    [isDragging]
  );

  return {
    refs: {
      container,
      resizer,
      resizableDiv,
    },
    isDragging,
    widthA,
    widthB,
  };
}

function ResizeGrid() {
  const { isDragging, widthA, refs, widthB } = useResizeThing('storybook-example');
  return (
    <div style={{ padding: 50 }}>
      <div ref={refs.container} style={{ display: 'flex', width: 600 }}>
        <SomeDiv style={{ flex: '1 1 0px', width: widthA }}>Test A</SomeDiv>
        <SomeHandle ref={refs.resizer} $isDragging={isDragging} />
        <SomeDiv ref={refs.resizableDiv} style={{ width: widthB }}>
          Test B
        </SomeDiv>
      </div>
    </div>
  );
}

export const ResizeLayoutDefault: React.FC = () => {
  return (
    <DndProvider backend={MultiBackend} options={HTML5toTouch}>
      <div>
        <ResizeGrid />
      </div>
    </DndProvider>
  );
};
