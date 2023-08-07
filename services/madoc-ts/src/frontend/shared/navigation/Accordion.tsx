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
  useMemo,
  useRef,
  useState,
} from 'react';
import { DownArrowIcon } from '../icons/DownArrowIcon';

export const AccordionContainer = styled.div`
  flex: 1;
  display: flex;
  width: 100%;
  flex-direction: column;
  position: relative;
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
    //display: flex;
    //flex-direction: column;
    //justify-content: center;
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

  &:focus {
    outline: none;
  }

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
  min-height: 0;
  overflow: visible;
  display: flex;
`;

const ItemBodyPadding = styled.div<{ $full?: boolean; $max?: boolean }>`
  min-height: 0;
  overflow: visible;
  flex: 1;
  padding: 1em 1em 1.5em;

  &[data-full='true'] {
    margin: 0;
  }

  &[data-max-height='true'] {
    overflow-y: auto;
  }
`;

const ItemBody = styled.section<{
  $initial?: boolean;
  $scrolled?: boolean;
}>`
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;

  [data-open='true'] & {
    opacity: 1;
    grid-template-rows: 1fr;
    visibility: visible;
    &[data-overflow='true'] {
      overflow: visible;
    }
  }

  transition: all 0.4s, visibility 0.8s;

  &[data-has-icon='true'] {
    padding-left: 4em;
  }

  box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0);
  &[data-scrolled='true'] {
    box-shadow: inset 0px 2px 0px 0 rgba(0, 0, 0, 0.1);
  }
`;

const ItemHeading = styled.div<{ $open?: boolean }>`
  position: sticky;
  display: flex;
  top: 0;
  background: #fff;
  min-width: 0;
  width: 100%;
  color: #757575;
  z-index: 1;
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

  [data-open='true'] & {
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
  }
`;

interface AccordionItemProps {
  label: string | ReactNode;
  description?: string | ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  initialOpen?: boolean;
  maxHeight?: number | false;
  fullWidth?: boolean;
  overflow?: boolean;
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

let keyIdIndex = 0;
function useId() {
  return useMemo(() => keyIdIndex++, []);
}

export function useAccordionItems(itemsLength: number, singleMode = false) {
  const [elRefs, setElRefs] = useState<RefObject<AccordionItemRef>[]>([]);
  const current = useRef(-1);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = e => {
    const currentEl = document.activeElement;
    const currentIndex = elRefs.findIndex(r => r.current?.button?.current === currentEl);
    if (currentIndex === -1) {
      return;
    }

    switch (e.code) {
      case 'Home': {
        const next = 0;
        if (elRefs[next]) {
          elRefs[next].current?.focus();
        }
        break;
      }
      case 'End': {
        const next = itemsLength - 1;
        if (elRefs[next]) {
          elRefs[next].current?.focus();
        }
        break;
      }

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
    if (singleMode && isOpen && key !== current.current) {
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

  const getItemProps = (key: number) => {
    return {
      ref: elRefs[key],
      onChange: (isOpen: boolean) => onChange(key, isOpen),
    };
  };

  const open = (key: number) => {
    const el = elRefs[key];
    if (el && el.current) {
      el.current.open();
    }
  };

  const close = (key: number) => {
    const el = elRefs[key];
    if (el && el.current) {
      el.current.close();
    }
  };

  const toggle = (key: number) => {
    const el = elRefs[key];
    if (el && el.current) {
      el.current.toggle();
    }
  };

  const focus = (key: number) => {
    const el = elRefs[key];
    if (el && el.current) {
      el.current.focus();
    }
  };

  const openAll = () => {
    for (let i = 0; i < elRefs.length; i++) {
      const ref = elRefs[i];
      ref.current?.open();
    }
  };

  const closeAll = () => {
    for (let i = 0; i < elRefs.length; i++) {
      const ref = elRefs[i];
      ref.current?.close();
    }
  };

  return {
    open,
    close,
    toggle,
    focus,
    openAll,
    closeAll,
    onKeyDown,
    getItemProps,
  };
}

export const AccordionItem = forwardRef<AccordionItemRef, AccordionItemProps>(function AccordionItem(props, ref) {
  const content = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const id = useId();

  const [open, setIsOpen] = useState<boolean>(props.initialOpen || false);
  const onChange = props.onChange || noop;
  const toggle = () => {
    onChange(!open);
    setIsOpen(o => !o);
  };
  const maxHeight = props.maxHeight;
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

  const onScroll: UIEventHandler<HTMLDivElement> = e => {
    if ((e.target as HTMLDivElement).scrollTop > 0) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };

  return (
    <ItemRow data-large={props.large} data-open={open}>
      <ItemHeading data-open={open}>
        {props.icon ? <ItemIcon onClick={toggle}>{props.icon}</ItemIcon> : null}
        <ItemLabel ref={btn} onClick={toggle} aria-expanded={open} aria-controls={`accordion-${id}`}>
          {props.label}
          {props.description ? <ItemDescription>{props.description}</ItemDescription> : null}
        </ItemLabel>
        <ItemCollapse onClick={toggle}>
          <DownArrowIcon width="1em" height="1em" rotate={open ? 0 : 180} />
        </ItemCollapse>
      </ItemHeading>
      <ItemBody
        aria-labelledby={`accordion-${id}`}
        aria-hidden={!open}
        data-overflow={!!props.overflow}
        data-has-icon={!!props.icon}
        onScroll={onScroll}
        ref={content}
        $initial={!open}
        data-scrolled={scrolled}
        hidden={!open}
      >
        <ItemBodyInner>
          <ItemBodyPadding
            data-max-height={!!maxHeight}
            data-full={props.fullWidth}
            style={{ maxHeight: maxHeight || undefined }}
          >
            {props.children}
          </ItemBodyPadding>
        </ItemBodyInner>
      </ItemBody>
    </ItemRow>
  );
});

interface AccordionProps {
  singleMode?: boolean;
  items: Array<AccordionItemProps>;
  maxHeight?: number | false;
  overflow?: boolean;
}

export function Accordion(props: AccordionProps) {
  const { getItemProps, onKeyDown } = useAccordionItems(props.items.length, props.singleMode);

  return (
    <AccordionContainer onKeyDown={onKeyDown}>
      {props.items.map((item, key) => (
        <AccordionItem overflow={props.overflow} maxHeight={props.maxHeight} key={key} {...item} {...getItemProps(key)}>
          {item.children}
        </AccordionItem>
      ))}
    </AccordionContainer>
  );
}
