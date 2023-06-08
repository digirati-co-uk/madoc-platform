import styled, { css } from 'styled-components';
import React, {
  createRef,
  forwardRef,
  KeyboardEventHandler,
  ReactNode,
  RefObject,
  UIEventHandler,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { DownArrowIcon } from '../icons/DownArrowIcon';

export const AccordionContainer = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const ItemRow = styled.div`
  background: #fff;
  position: relative;
  border-bottom: 1px solid #d0d0d0;
  border-top: 1px solid #d0d0d0;

  & ~ & {
    border-top: none;
  }

  &[data-large='true'] {
    background: #f7f7f7;
    border: none;
    margin-bottom: 1em;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
`;

const ItemDescription = styled.p`
  font-size: 0.9em;
  color: #777;
  font-weight: 400;
`;

const ItemLabel = styled.button`
  color: inherit;
  text-rendering: geometricPrecision;
  border: none;
  text-align: left;
  background: transparent;
  font: inherit;
  text-transform: uppercase;
  padding: 0.6em 1.2em;
  flex: 1;
  font-size: 0.8em;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  min-width: 0;
  overflow: hidden;

  p {
    display: none;
  }

  [data-large='true'] & {
    //padding: 1.5em;
    padding: 0.85em 1.25em;
    display: block;
    text-transform: initial;
    font-size: 1em;
    margin-bottom: 0;
    color: #000;

    p {
      display: block;
      color: #999;
      font-size: 0.9em;
      margin: 0;
      margin-top: 0.5em;
    }
  }
`;

const ItemCollapse = styled.div`
  font-size: 1.4em;
  padding-right: 0.3em;
  display: flex;
  align-items: center;

  [data-large='true'] & {
    font-size: 2em;
  }
`;

const ItemIcon = styled.div`
  width: 2em;
  align-items: center;
  //padding-top: 0.5em;
  display: flex;
  justify-content: center;
  margin-left: 1.5em;
  svg {
    width: 1.75em;
    height: 1.75em;
    fill: #999;
    color: #999;
  }
`;

const ItemBodyInner = styled.div<{ $full?: boolean }>`
  ${props =>
    props.$full
      ? css`
          margin: 0;
        `
      : css`
          margin: 1em 1em 1.5em;
        `}
`;

const ItemBody = styled.div<{
  $hidden?: boolean;
  $initial?: boolean;
  $maxHeight?: number;
  $scrolled?: boolean;
}>`
  transition: height 0.2s, box-shadow 0.2s;
  overflow: hidden;

  &[data-has-icon='true'] {
    padding-left: 4em;
  }

  ${props =>
    props.$scrolled
      ? css`
          box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0.1);
        `
      : css`
          box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0);
        `}

  ${props =>
    props.$initial
      ? css`
          position: absolute;
          opacity: 0;
          height: auto;
        `
      : css`
          max-height: ${props.$maxHeight || '120'}px;
          overflow-y: auto;
        `}
`;

const ItemHeading = styled.div<{ $open?: boolean }>`
  position: sticky;
  display: flex;
  top: 0;
  background: #fff;
  min-width: 0;
  width: 100%;
  color: #757575;
  &:hover {
    color: #333;
  }

  [data-large='true'] & {
    border: 1px solid #d0d0d0;
    &:after {
      display: none;
    }
  }

  [data-large='true']:focus-within & {
    border-color: #3579f6;
  }

  ${props =>
    props.$open &&
    css`
      color: #333;
      &:after {
        content: '';
        height: 1px;
        background: #eee;
        position: absolute;
        top: 100%;
        left: 0.5em;
        right: 0.5em;
      }
    `}
`;

function runWhenEntered(element: HTMLElement, callback: () => void) {
  const parent = element.closest('.transition');
  if (parent && !parent.classList.contains('transition-entered')) {
    const style = window.getComputedStyle(parent);
    const t = setTimeout(
      callback,
      parseFloat(style.transitionDuration) * (style.transitionDuration.endsWith('ms') ? 1 : 1000) || 0
    );
    return () => {
      clearTimeout(t);
    };
  } else {
    callback();
  }
}

interface AccordionItemProps {
  label: string | ReactNode;
  description?: string | ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  initialOpen?: boolean;
  maxHeight?: number | false;
  fullWidth?: boolean;
  onChange?: (value: boolean) => void;
  large?: boolean;
}

export interface AccordionItemRef {
  open(): void;
  close(): void;
  toggle(): void;
  focus(): void;
  button?: RefObject<HTMLButtonElement>;
}

const noop = (() => void 0) as any;

export const AccordionItem = forwardRef<AccordionItemRef, AccordionItemProps>(function AccordionItem(props, ref) {
  const content = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);

  const [open, setIsOpen] = useState<boolean>(props.initialOpen || false);
  const onChange = props.onChange || noop;
  const toggle = () => {
    onChange(!open);
    setIsOpen(o => !o);
  };
  const [_height, setHeight] = useState<number | undefined>(undefined);
  const maxHeight = props.maxHeight === false ? 1000000 : props.maxHeight || 800;
  const initial = typeof _height === 'undefined';
  const height = Math.min(_height || 0, maxHeight);
  const [scrolled, setScrolled] = useState(false);

  useImperativeHandle(ref, () => ({
    open() {
      onChange(true);
      setIsOpen(true);
    },
    close() {
      onChange(false);
      setIsOpen(false);
    },
    toggle() {
      toggle();
    },
    focus() {
      if (btn.current) {
        btn.current.focus();
      }
    },
    button: btn,
  }));

  useLayoutEffect(() => {
    if (content.current && initial) {
      if (content.current) {
        return runWhenEntered(content.current, () => {
          if (content.current) {
            const bounds = content.current.getBoundingClientRect();
            setHeight(bounds.height);
          }
        });
      }
    }
  }, [initial]);

  const onScroll: UIEventHandler<HTMLDivElement> = e => {
    if ((e.target as HTMLDivElement).scrollTop > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <ItemRow data-large={props.large} data-open={open}>
      <ItemHeading $open={open}>
        {props.icon ? <ItemIcon onClick={toggle}>{props.icon}</ItemIcon> : null}
        <ItemLabel ref={btn} onClick={toggle}>
          {props.label}
          {props.description ? <ItemDescription>{props.description}</ItemDescription> : null}
        </ItemLabel>
        <ItemCollapse onClick={toggle}>
          <DownArrowIcon width="1em" height="1em" rotate={open ? 0 : 180} />
        </ItemCollapse>
      </ItemHeading>
      <ItemBody
        data-has-icon={!!props.icon}
        onScroll={onScroll}
        ref={content}
        $initial={initial && !open}
        $maxHeight={maxHeight}
        $scrolled={scrolled}
        style={{
          height: initial ? undefined : open && height ? height : 0,
          transitionDuration: `${Math.max(200, height * 0.7)}ms`,
        }}
      >
        <ItemBodyInner $full={props.fullWidth}>{props.children}</ItemBodyInner>
      </ItemBody>
    </ItemRow>
  );
});

interface AccordionProps {
  singleMode?: boolean;
  items: Array<AccordionItemProps>;
  maxHeight?:  number | false;
}

export function Accordion(props: AccordionProps) {
  const itemsLength = props.items.length;
  const [elRefs, setElRefs] = useState<RefObject<AccordionItemRef>[]>([]);
  const current = useRef(-1);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
    const currentEl = document.activeElement;
    const currentIndex = elRefs.findIndex(r => r.current?.button?.current === currentEl);
    if (currentIndex === -1) {
      return;
    }

    switch (e.code) {
      case 'ArrowDown': {
        if (currentIndex !== itemsLength - 1) {
          const next = currentIndex + 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
      // Focus previous
      case 'ArrowUp': {
        if (currentIndex !== 0) {
          const next = currentIndex - 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
      // Focus next
      case 'ArrowLeft': {
        // Close current
        const el = elRefs[currentIndex];
        if (el && el.current) {
          el.current.close();
        }
        break;
      }
      // Open current
      case 'ArrowRight': {
        // Close current
        const el = elRefs[currentIndex];
        if (el && el.current) {
          el.current.open();
        }
        break;
      }
    }
  };

  const onChange = (key: number, isOpen: boolean) => {
    if (props.singleMode && isOpen && key !== current.current) {
      current.current = key;
      for (let i = 0; i < elRefs.length; i++) {
        const ref = elRefs[i];
        if (i === key) {
          continue;
        }
        ref.current?.close();
      }
    }
  };

  useEffect(() => {
    // add or remove refs
    setElRefs(elRefs_ =>
      Array(itemsLength)
        .fill(0)
        .map((_, i) => elRefs_[i] || createRef())
    );
  }, [itemsLength]);

  return (
    <AccordionContainer onKeyDown={onKeyDown}>
      {props.items.map((item, key) => (
        <AccordionItem
          maxHeight={props.maxHeight}
          key={key}
          ref={elRefs[key]}
          {...item}
          onChange={isOpen => onChange(key, isOpen)}
        >
          {item.children}
        </AccordionItem>
      ))}
    </AccordionContainer>
  );
}
