import { InternationalString } from '@iiif/presentation-3';
import React, { createRef, KeyboardEventHandler, useLayoutEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { LocaleString } from './LocaleString';

export interface InlineSelectProps<T> {
  name?: string;
  id?: string;
  value?: T | null;
  onChange?: (value: T) => void;
  onDeselect?: () => void;
  options: Array<{ label: string | InternationalString; value: string }>;
}

const Container = styled.div`
  background: #e4e7f0;
  display: flex;
  border: 1px solid #b1b1b1;
  border-radius: 3px;
  overflow: hidden;

  &[data-vertical='true'] {
    flex-direction: column;
    max-height: 13em;
    overflow: auto;
  }
`;

const Item = styled.button`
  flex: 1;
  background: transparent;
  border: none;
  padding: 0.6em;
  color: #777;
  white-space: nowrap;
  font-size: 0.875em;

  &:hover {
    background: #eff2f6;
  }

  &:focus {
    // ?
  }

  & ~ & {
    border-left: 1px solid #b1b1b1;
  }

  &[data-active='true'] {
    background: #fff;
    color: #000;
  }

  [data-vertical='true'] & {
    border-left: none;
  }

  [data-vertical='true'] & ~ & {
    border-top: 1px solid #b1b1b1;
  }
`;

export function InlineSelect<T extends string = string>(props: InlineSelectProps<T>) {
  const [currentValue, _setCurrentValue] = useState(props.value);
  const itemsLength = props.options.length;
  const elRefs = useMemo(() => props.options.map(() => createRef()), [props.options]) as any[];

  const setCurrentValue = (newValue: T) => {
    if (props.onChange) {
      props.onChange(newValue);
    }
    _setCurrentValue(newValue);
  };

  useLayoutEffect(() => {
    if (props.id) {
      const listener = () => {
        const idx = props.options.findIndex(b => b.value === props.value);
        if (idx !== -1 && elRefs[idx].current) {
          elRefs[idx].current.focus();
        }
      };

      const $el = document.querySelector(`label[for="${props.id}"]`);
      if ($el) {
        $el.addEventListener('click', listener);
        return () => {
          $el.removeEventListener('click', listener);
        };
      }
    }
  }, [props.id]);

  const onKeyDown: KeyboardEventHandler<HTMLElement> = e => {
    const currentEl = document.activeElement;
    const currentIndex = elRefs.findIndex(r => r.current === currentEl);
    if (currentIndex === -1) {
      return;
    }

    switch (e.code) {
      case 'ArrowRight':
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
      case 'ArrowLeft':
      case 'ArrowUp': {
        if (currentIndex !== 0) {
          const next = currentIndex - 1;
          if (elRefs[next]) {
            elRefs[next].current?.focus();
          }
        }
        break;
      }
    }
  };

  return (
    <Container data-vertical={props.options.length > 4}>
      {props.options.map((option, idx) => {
        return (
          <Item
            key={option.value}
            data-active={option.value === currentValue}
            ref={elRefs[idx]}
            id={option.value === currentValue ? props.id : undefined}
            onKeyDown={onKeyDown}
            onClick={() => {
              if (option.value === currentValue && props.onDeselect) {
                props.onDeselect();
                setCurrentValue('' as any);
              } else {
                setCurrentValue(option.value as any);
              }
            }}
          >
            <LocaleString>{option.label}</LocaleString>
          </Item>
        );
      })}

      {props.name ? <input type="hidden" name={props.name} value={currentValue || undefined} /> : null}
    </Container>
  );
}
