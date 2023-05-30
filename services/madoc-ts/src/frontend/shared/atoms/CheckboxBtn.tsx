import React from 'react';
import styled from 'styled-components';
import { InternationalString } from '@iiif/presentation-3';

const Box = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 0;
  border: none;
  background-color: transparent;
  text-align: left;

  :disabled {
    pointer-events: none;
    filter: grayscale(80%);
  }
`;

const CheckText = styled.div`
  font-size: 14px;
  font-weight: normal;
  text-transform: capitalize;

  :hover {
    cursor: pointer;
  }
`;

const SubText = styled.p`
  color: grey;
  margin: 0;
`;

const CountText = styled.small`
  color: black;
  font-size: 12px;
`;

const CheckWrapper = styled.div`
  position: relative;
`;

const FakeCheck = styled.div<{ $color?: string }>`
  position: relative;
  margin: 10px;
  width: 12px;
  height: 12px;
  border: none;
  border-radius: 1px;
  background-color: transparent;
  outline: ${props => (props.$color ? `2px solid ${props.$color}` : '2px solid #4265e9')};
  outline-offset: 2px;
  transition: 0.1s;

  &[data-is-checked='true'] {
    background-color: ${props => (props.$color ? props.$color : '#4265e9')};
  }
`;

const Check = styled.input`
  position: absolute;
  margin: auto;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  text-align: center;
  opacity: 0;
  cursor: pointer;
`;

export const CheckboxBtn: React.FC<{
  disabled?: boolean;
  checked: boolean;
  onChange?: any;
  inLineLabel?: string | InternationalString;
  subLabel?: string | InternationalString;
  countText?: string | number;
  id?: any;
  color?: string;
}> = ({ disabled, checked, onChange, inLineLabel, subLabel, countText, id, color }) => {

  return (
    <Box aria-label={disabled ? 'disabled checkbox filter' : 'checkbox filter'}>
      <CheckWrapper>
        <FakeCheck data-is-checked={checked} $color={color} />
        <Check type={'checkbox'} onChange={onChange} id={id ? id : ''} checked={checked} />
      </CheckWrapper>

      <CheckText>
        {inLineLabel}
        {countText && <CountText> ({countText})</CountText>}
        {subLabel && <SubText>{subLabel}</SubText>}
      </CheckText>
    </Box>
  );
};
