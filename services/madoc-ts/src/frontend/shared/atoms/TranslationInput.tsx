import React, { useLayoutEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import { Input } from '../form/Input';

const TranslationInputContainer = styled.div<{ $focus?: boolean }>`
  background: #fff;
  display: flex;
  padding: 0.2em;

  &:hover {
    background: #eee;
  }

  ${props =>
    props.$focus &&
    css`
      background: #d6dfff;
      &:hover {
        background: #d6dfff;
      }
    `}
`;

const TranslationInputLabel = styled.label`
  width: 50%;
  align-self: center;
  padding-left: 1em;
`;

const TranslationInputField = styled.div`
  width: 50%;
`;

export const TranslationInput: React.FC<{ id: string; label: any; value: string; onChange: (e: any) => void }> = ({
  id,
  label,
  value,
  onChange,
}) => {
  const ref = useRef<HTMLInputElement>();
  const [isFocus, setFocus] = useState(false);

  useLayoutEffect(() => {
    if (ref.current) {
      const $el = ref.current;
      const focusHandler = () => {
        setFocus(true);
      };
      const blurHandler = () => {
        setFocus(false);
      };

      $el.addEventListener('focus', focusHandler);
      $el.addEventListener('blur', blurHandler);

      return () => {
        if ($el) {
          $el.removeEventListener('focus', focusHandler);
          $el.removeEventListener('blur', blurHandler);
        }
      };
    }
  });

  return (
    <TranslationInputContainer $focus={isFocus}>
      <TranslationInputLabel htmlFor={id}>{label}</TranslationInputLabel>
      <TranslationInputField>
        <Input ref={ref as any} value={value} onChange={e => onChange(e.target.value)} id={id} />
      </TranslationInputField>
    </TranslationInputContainer>
  );
};
