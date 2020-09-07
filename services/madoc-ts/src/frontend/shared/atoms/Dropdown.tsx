import React from 'react';
import styled from 'styled-components';

export const Dropdown: React.FC<{
  options: Array<string>;
  placeholder: string;
  onChange: (val: string) => void;
}> = ({ options, placeholder, onChange }) => {
  return (
    <select placeholder={placeholder} onChange={val => onChange(val.target.value)}>
      <option value="1" disabled defaultChecked>
        {placeholder}
      </option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};
