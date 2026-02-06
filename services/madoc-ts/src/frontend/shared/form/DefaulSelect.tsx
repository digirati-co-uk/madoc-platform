import React from 'react';
import { Select } from './FunctionalSelect';
import { useTranslation } from 'react-i18next';

type TemporaryReactFunctionalSelectProps = {
  inputId?: string;
  placeholder?: string;
  initialValue?: any;
  isInvalid?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isDisabled?: boolean;
  noOptionsMsg?: string;
  filterMatchFrom?: string;
  options: Array<any>;
  renderOptionLabel?: (opts: any) => any;
  getOptionLabel?: (opts: any) => any;
  getOptionValue?: (opts: any) => any;
  onOptionChange?: (opts: any) => void;
  onInputChange?: (opts: any) => void;
  onSearchChange?: (opts: any) => void;
};

export const DefaultSelect = React.forwardRef<any, TemporaryReactFunctionalSelectProps>((props, ref) => {
  const { t } = useTranslation();

  const _Select: any = Select;

  return (
    <_Select
      ref={ref}
      themeConfig={{
        color: {
          primary: '#005cc5',
        },
        select: {
          css: 'font-size: 0.9em; height: auto;',
        },
        control: {
          boxShadow: '0 0 0 0',
          focusedBorderColor: '#005cc5',
          selectedBgColor: '#005cc5',
          backgroundColor: '#fff',
        },
        noOptions: {
          fontSize: '.8em',
          padding: '2em 0',
        },
        menu: {
          option: {
            css: `height: auto`,
          },
          css: `
              position: fixed;
              width: 500px;
              overflow: hidden;
              border: none;
              box-shadow: 0 4px 15px 0 rgba(0, 0, 0, 0.18), 0 0px 0px 1px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(255, 255, 255, 0.2);
            `,
        },
      }}
      placeholder={props.placeholder ? t(props.placeholder) : t('Select option...')}
      noOptionsMsg={t('No options')}
      filterMatchFrom="any"
      getOptionValue={(option: any) => option.id}
      {...props}
      isDisabled={props.isDisabled}
    />
  );
});

DefaultSelect.displayName = 'DefaultSelect';
