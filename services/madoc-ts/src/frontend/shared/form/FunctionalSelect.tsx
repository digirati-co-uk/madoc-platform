import React, { useCallback, useDeferredValue, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Button as AriaButton, ComboBox, Input, ListBox, ListBoxItem, Popover, type Key } from 'react-aria-components';

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
const SEARCH_DEBOUNCE_MS = 200;

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

function getBorderRadiusClass(radius?: string): string {
  switch (radius) {
    case '0':
    case '0px':
      return 'rounded-none';
    case '2px':
      return 'rounded-sm';
    case '3px':
      return 'rounded-[3px]';
    case '6px':
      return 'rounded-md';
    case '8px':
      return 'rounded-lg';
    case '9999px':
      return 'rounded-full';
    default:
      return 'rounded';
  }
}

function getColorClass(color?: string): string {
  switch (color) {
    case '#d63031':
      return 'text-[#d63031]';
    case '#005cc5':
    default:
      return 'text-[#005cc5]';
  }
}

function getMenuItemSizeClass(menuItemSize?: number): string {
  switch (menuItemSize) {
    case 55:
      return 'min-h-[55px]';
    case 44:
      return 'min-h-11';
    default:
      return 'min-h-9';
  }
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
  const borderRadius = themeConfig?.control?.borderRadius || '4px';
  const searchable = isSearchable || !!onSearchChange || !!onInputChange;
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const deferredInputValue = useDeferredValue(inputValue);
  const borderRadiusClass = getBorderRadiusClass(borderRadius);
  const accentColorClass = getColorClass(focusedBorderColor);
  const selectedMarkColorClass = getColorClass(primaryColor);
  const menuItemSizeClass = getMenuItemSizeClass(menuItemSize);

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
    if (!searchable || onSearchChange || !deferredInputValue.trim()) {
      return normalizedOptions;
    }
    const query = deferredInputValue.toLowerCase();
    return normalizedOptions.filter(item => item.textValue.toLowerCase().includes(query));
  }, [deferredInputValue, normalizedOptions, onSearchChange, searchable]);

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

  const clearPendingSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }
  }, []);

  const openMenu = useCallback(() => {
    setIsOpen(true);
    inputRef.current?.focus();
  }, []);

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
    clearPendingSearch();
    if (isMulti) {
      setSelectedKeys(new Set());
      setInputValue('');
      onOptionChange?.(null);
      return;
    }
    setSelectedKey(null);
    setInputValue('');
    onOptionChange?.(undefined);
  }, [clearPendingSearch, isMulti, onOptionChange]);

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
    // Sync only when the provided initial value changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialValue, isMulti]);

  useImperativeHandle(
    ref,
    () => ({
      setValue,
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
      clearValue,
      toggleMenu: menuOpen => {
        if (menuOpen === false) {
          setIsOpen(false);
          inputRef.current?.blur();
          return;
        }
        openMenu();
      },
    }),
    [clearValue, openMenu, setValue]
  );

  const onInputUpdate = useCallback(
    (value: string) => {
      setInputValue(value);
      onInputChange?.(value);
      if (!onSearchChange) {
        return;
      }

      clearPendingSearch();

      searchTimeoutRef.current = setTimeout(() => {
        onSearchChange(value);
        searchTimeoutRef.current = null;
      }, SEARCH_DEBOUNCE_MS);
    },
    [clearPendingSearch, onInputChange, onSearchChange]
  );

  useEffect(() => {
    return () => {
      clearPendingSearch();
    };
  }, [clearPendingSearch]);

  return (
    <ComboBox
      id={inputId}
      allowsCustomValue={true}
      allowsEmptyCollection
      isDisabled={isDisabled}
      // @ts-ignore
      isOpen={isOpen}
      selectedKey={isMulti ? null : selectedKey}
      inputValue={inputValue}
      onInputChange={onInputUpdate}
      onOpenChange={setIsOpen}
      menuTrigger={searchable ? 'input' : 'focus'}
      onSelectionChange={selected => {
        clearPendingSearch();
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
      className="w-full"
    >
      <div
        className={`flex min-h-[38px] w-full items-center border bg-white shadow-none outline-none ${borderRadiusClass} ${
          isInvalid ? 'border-[#d63031]' : 'border-[#c8ced6]'
        }`}
      >
        <Input
          ref={inputRef}
          id={inputId}
          aria-label={placeholder || 'Select option'}
          readOnly={!searchable}
          onClick={() => {
            if (!searchable) {
              openMenu();
            }
          }}
          placeholder={isMulti ? selectedMultiLabel || placeholder : placeholder}
          className="flex-1 min-w-0 border-0 bg-transparent px-2.5 py-2 text-[0.9em] text-[#222] outline-none"
        />
        {isClearable && (isMulti ? selectedKeys.size > 0 : !!selectedKey) ? (
          <AriaButton
            type="button"
            aria-label="Clear value"
            onPress={() => clearValue()}
            className="cursor-pointer border-0 bg-transparent px-2 text-[18px] leading-none text-[#5c6370]"
          >
            ×
          </AriaButton>
        ) : null}
        <AriaButton
          type="button"
          aria-label="Toggle options"
          onPress={() => openMenu()}
          className={`cursor-pointer border-0 bg-transparent px-2.5 text-xs leading-none ${accentColorClass}`}
        >
          ▾
        </AriaButton>
      </div>
      <Popover
        offset={4}
        className="z-40 my-1 max-h-80 w-[var(--trigger-width)] overflow-auto rounded-md border border-[#d0d7de] bg-white drop-shadow-lg"
      >
        {isLoading ? (
          <div className="px-2.5 py-3 text-[0.85em] text-[#5c6370]">Loading...</div>
        ) : filteredOptions.length ? (
          <ListBox
            items={filteredOptions}
            aria-label={placeholder || 'Select option'}
            className="max-h-80 overflow-y-auto"
          >
            {item => (
              <ListBoxItem
                id={item.key}
                textValue={item.textValue || valueToText(item.option)}
                className={({ isFocused }) =>
                  `flex box-border cursor-pointer items-start border-t border-t-black/[0.03] px-2.5 py-2 text-[#161b22] ${menuItemSizeClass} ${
                    isFocused ? 'bg-[#005cc5]/[0.08]' : 'bg-white'
                  }`
                }
              >
                <div className="flex w-full items-start gap-2">
                  <span className="block min-w-0 flex-1 whitespace-normal [overflow-wrap:anywhere]">
                    {item.renderLabel}
                  </span>
                  {isMulti && selectedKeys.has(item.key) ? (
                    <span className={`text-[1.3em] font-bold leading-none ${selectedMarkColorClass}`} aria-hidden>
                      ✓
                    </span>
                  ) : null}
                </div>
              </ListBoxItem>
            )}
          </ListBox>
        ) : (
          <div className="px-2.5 py-3 text-[0.85em] text-[#5c6370]">{noOptionsMsg || 'No options'}</div>
        )}
      </Popover>
    </ComboBox>
  );
});
