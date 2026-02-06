import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import {
  Button as AriaButton,
  ComboBox,
  Input,
  ListBox,
  ListBoxItem,
  Popover,
  type Key,
} from 'react-aria-components';

export type SelectRef = {
  setValue?: (value: unknown) => void;
  focus?: () => void;
  blur?: () => void;
  clearValue?: () => void;
  toggleMenu?: (open?: boolean) => void;
};

type SelectTheme = {
  color?: {
    primary?: string;
  };
  control?: {
    focusedBorderColor?: string;
    backgroundColor?: string;
    borderRadius?: string;
  };
};

type SelectProps = {
  inputId?: string;
  placeholder?: string;
  initialValue?: any;
  isInvalid?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  isSearchable?: boolean;
  noOptionsMsg?: string;
  options?: any[];
  renderOptionLabel?: (option: any) => React.ReactNode;
  getOptionLabel?: (option: any) => React.ReactNode;
  getOptionValue?: (option: any) => Key;
  onOptionChange?: (option: any) => void;
  onInputChange?: (value?: string) => void;
  onSearchChange?: (value?: string) => void;
  isMulti?: boolean;
  menuItemSize?: number;
  themeConfig?: SelectTheme;
};

type NormalizedOption = {
  key: string;
  option: any;
  textValue: string;
  renderLabel: React.ReactNode;
};

const DEFAULT_PRIMARY = '#005cc5';
const DEFAULT_BORDER = '#c8ced6';
const DEFAULT_ERROR = '#d63031';

function valueToText(value: any): string {
  if (typeof value === 'string' || typeof value === 'number') {
    return String(value);
  }
  if (!value || typeof value !== 'object') {
    return '';
  }

  if (typeof value.label === 'string') {
    return value.label;
  }
  if (Array.isArray(value.label) && value.label[0]) {
    return String(value.label[0]);
  }
  if (value.label && typeof value.label === 'object') {
    const locale = Object.keys(value.label)[0];
    const localeValue = locale ? value.label[locale] : undefined;
    if (Array.isArray(localeValue) && localeValue[0]) {
      return String(localeValue[0]);
    }
  }
  if (typeof value.name === 'string') {
    return value.name;
  }
  if (typeof value.text === 'string') {
    return value.text;
  }
  if (typeof value.value === 'string' || typeof value.value === 'number') {
    return String(value.value);
  }
  return '';
}

function normalizeValueKey(key: Key | null | undefined): string | null {
  if (key === null || typeof key === 'undefined') {
    return null;
  }
  return String(key);
}

export const Select = React.forwardRef<SelectRef, SelectProps>(function SafeFunctionalSelect(
  {
    inputId,
    placeholder,
    initialValue,
    isInvalid,
    isLoading,
    isClearable,
    isDisabled,
    isSearchable,
    noOptionsMsg,
    options = [],
    renderOptionLabel,
    getOptionLabel,
    getOptionValue,
    onOptionChange,
    onInputChange,
    onSearchChange,
    isMulti,
    menuItemSize,
    themeConfig,
  },
  ref
) {
  const primaryColor = themeConfig?.color?.primary || DEFAULT_PRIMARY;
  const focusedBorderColor = themeConfig?.control?.focusedBorderColor || primaryColor;
  const backgroundColor = themeConfig?.control?.backgroundColor || '#fff';
  const borderRadius = themeConfig?.control?.borderRadius || '4px';
  const searchable = isSearchable || !!onSearchChange || !!onInputChange;
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');

  const getResolvedOptionValue = useCallback(
    (option: any, index: number): Key => {
      if (getOptionValue) {
        return getOptionValue(option);
      }
      if (option && typeof option === 'object') {
        if (typeof option.id !== 'undefined') {
          return option.id;
        }
        if (typeof option.value !== 'undefined') {
          return option.value;
        }
      }
      if (typeof option === 'string' || typeof option === 'number') {
        return option;
      }
      return index;
    },
    [getOptionValue]
  );

  const normalizedOptions = useMemo<NormalizedOption[]>(() => {
    return (options || []).map((option, index) => {
      const optionLabel = getOptionLabel ? getOptionLabel(option) : valueToText(option);
      const textValue = valueToText(optionLabel) || valueToText(option);

      return {
        key: String(getResolvedOptionValue(option, index)),
        option,
        textValue,
        renderLabel: renderOptionLabel ? renderOptionLabel(option) : optionLabel,
      };
    });
  }, [getOptionLabel, getResolvedOptionValue, options, renderOptionLabel]);

  const filteredOptions = useMemo(() => {
    if (!searchable || onSearchChange || !inputValue.trim()) {
      return normalizedOptions;
    }
    const query = inputValue.toLowerCase();
    return normalizedOptions.filter(item => item.textValue.toLowerCase().includes(query));
  }, [inputValue, normalizedOptions, onSearchChange, searchable]);

  const optionMap = useMemo(() => {
    const map = new Map<string, NormalizedOption>();
    for (const item of normalizedOptions) {
      map.set(item.key, item);
    }
    return map;
  }, [normalizedOptions]);

  const selectedOptionsForMulti = useMemo(() => {
    return Array.from(selectedKeys)
      .map(key => optionMap.get(key)?.option)
      .filter(Boolean);
  }, [optionMap, selectedKeys]);

  const selectedMultiLabel = useMemo(() => {
    return selectedOptionsForMulti
      .map(option => valueToText(getOptionLabel ? getOptionLabel(option) : option))
      .filter(Boolean)
      .join(', ');
  }, [getOptionLabel, selectedOptionsForMulti]);

  const getKeyFromValue = useCallback(
    (value: unknown): string | null => {
      if (value === null || typeof value === 'undefined' || value === '') {
        return null;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        const asString = String(value);
        if (optionMap.has(asString)) {
          return asString;
        }
      }

      if (typeof value === 'object' && value !== null) {
        const index = normalizedOptions.findIndex(item => item.option === value);
        if (index !== -1) {
          return normalizedOptions[index].key;
        }
        const candidate = normalizeValueKey(getResolvedOptionValue(value, 0));
        if (candidate && optionMap.has(candidate)) {
          return candidate;
        }
      }

      return null;
    },
    [getResolvedOptionValue, normalizedOptions, optionMap]
  );

  const clearValue = useCallback(() => {
    if (isMulti) {
      setSelectedKeys(new Set());
      setInputValue('');
      onOptionChange?.(null);
      return;
    }
    setSelectedKey(null);
    setInputValue('');
    onOptionChange?.(undefined);
  }, [isMulti, onOptionChange]);

  const setValue = useCallback(
    (value: unknown) => {
      if (isMulti) {
        const next = new Set<string>();
        if (Array.isArray(value)) {
          for (const item of value) {
            const key = getKeyFromValue(item);
            if (key) {
              next.add(key);
            }
          }
        }
        setSelectedKeys(next);
        setInputValue('');
        return;
      }

      const key = getKeyFromValue(value);
      setSelectedKey(key);
      if (key && optionMap.has(key)) {
        const selected = optionMap.get(key);
        setInputValue(selected?.textValue || '');
      } else {
        setInputValue('');
      }
    },
    [getKeyFromValue, isMulti, optionMap]
  );

  useEffect(() => {
    if (isMulti) {
      setValue(Array.isArray(initialValue) ? initialValue : []);
      return;
    }
    setValue(initialValue);
  }, [initialValue, isMulti, options, setValue]);

  useImperativeHandle(
    ref,
    () => ({
      setValue,
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clearValue,
      toggleMenu: menuOpen => {
        if (menuOpen === false) {
          inputRef.current?.blur();
          return;
        }
        inputRef.current?.focus();
        inputRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      },
    }),
    [clearValue, setValue]
  );

  const onInputUpdate = useCallback(
    (value: string) => {
      setInputValue(value);
      onInputChange?.(value);
      onSearchChange?.(value);
    },
    [onInputChange, onSearchChange]
  );

  const borderColor = isInvalid ? DEFAULT_ERROR : DEFAULT_BORDER;

  return (
    <ComboBox
      id={inputId}
      allowsCustomValue={true}
      isDisabled={isDisabled}
      selectedKey={isMulti ? null : selectedKey}
      inputValue={inputValue}
      onInputChange={onInputUpdate}
      menuTrigger={searchable ? 'input' : 'focus'}
      onSelectionChange={selected => {
        const key = normalizeValueKey(selected);
        if (!key || !optionMap.has(key)) {
          if (!isMulti) {
            clearValue();
          }
          return;
        }

        const option = optionMap.get(key)?.option;
        if (!option) {
          return;
        }

        if (isMulti) {
          setSelectedKeys(previous => {
            const next = new Set(previous);
            if (next.has(key)) {
              next.delete(key);
            } else {
              next.add(key);
            }
            const selectedOptions = Array.from(next)
              .map(selectedItemKey => optionMap.get(selectedItemKey)?.option)
              .filter(Boolean);
            onOptionChange?.(selectedOptions.length ? selectedOptions : null);
            return next;
          });
          setInputValue('');
          return;
        }

        setSelectedKey(key);
        setInputValue(valueToText(getOptionLabel ? getOptionLabel(option) : option));
        onOptionChange?.(option);
      }}
      style={{ width: '100%' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          minHeight: 38,
          width: '100%',
          border: `1px solid ${borderColor}`,
          borderRadius,
          backgroundColor,
          boxSizing: 'border-box',
          boxShadow: '0 0 0 0',
          outline: 'none',
        }}
      >
        <Input
          ref={inputRef}
          id={inputId}
          aria-label={placeholder || 'Select option'}
          readOnly={!searchable}
          placeholder={isMulti ? selectedMultiLabel || placeholder : placeholder}
          style={{
            flex: 1,
            minWidth: 0,
            border: 'none',
            outline: 'none',
            background: 'transparent',
            padding: '8px 10px',
            fontSize: '0.9em',
            color: '#222',
          }}
        />
        {isClearable && (isMulti ? selectedKeys.size > 0 : !!selectedKey) ? (
          <AriaButton
            type="button"
            aria-label="Clear value"
            onPress={() => clearValue()}
            style={{
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              padding: '0 8px',
              color: '#5c6370',
              fontSize: '18px',
              lineHeight: 1,
            }}
          >
            ×
          </AriaButton>
        ) : null}
        <AriaButton
          type="button"
          aria-label="Toggle options"
          onPress={() => {
            inputRef.current?.focus();
            inputRef.current?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          }}
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            padding: '0 10px',
            color: focusedBorderColor,
            fontSize: '12px',
            lineHeight: 1,
          }}
        >
          ▾
        </AriaButton>
      </div>
      <Popover
        offset={4}
        style={{
          maxHeight: 320,
          overflow: 'auto',
          width: 'var(--trigger-width)',
          border: '1px solid #d0d7de',
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15)',
          zIndex: 40,
        }}
      >
        {isLoading ? (
          <div style={{ padding: '12px 10px', fontSize: '0.85em', color: '#5c6370' }}>Loading...</div>
        ) : filteredOptions.length ? (
          <ListBox items={filteredOptions} aria-label={placeholder || 'Select option'}>
            {item => (
              <ListBoxItem
                id={item.key}
                textValue={item.textValue || valueToText(item.option)}
                style={({ isFocused }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: menuItemSize || 36,
                  padding: '8px 10px',
                  cursor: 'pointer',
                  boxSizing: 'border-box',
                  background: isFocused ? 'rgba(0, 92, 197, 0.08)' : '#fff',
                  color: '#161b22',
                  borderTop: '1px solid rgba(0, 0, 0, 0.03)',
                })}
              >
                <span style={{ width: '100%' }}>
                  {item.renderLabel}
                  {isMulti && selectedKeys.has(item.key) ? (
                    <span style={{ float: 'right', color: primaryColor, fontWeight: 700 }} aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </span>
              </ListBoxItem>
            )}
          </ListBox>
        ) : (
          <div style={{ padding: '12px 10px', fontSize: '0.85em', color: '#5c6370' }}>
            {noOptionsMsg || 'No options'}
          </div>
        )}
      </Popover>
    </ComboBox>
  );
});
