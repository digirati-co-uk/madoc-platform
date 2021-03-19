import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button, ButtonRow } from '../../shared/atoms/Button';
import { useData } from '../../shared/hooks/use-data';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

const PlaintextContainer = styled.div`
  position: relative;
`;

const PlaintextBackground = styled.div`
  background: #eee;
  display: flex;
  padding: 1em;
  padding-top: calc(1em + 20px);
  justify-content: space-around;
`;

const PlaintextInnerContainer = styled.div`
  background: #fff;
  white-space: pre;
  width: auto;
  padding: 2em 3em;
  font-size: 0.9em;
  line-height: 1.4em;
  max-height: 80vh;
  overflow: auto;
  max-width: 100%;
`;

const PlaintextActions = styled.div`
  position: absolute;
  top: 0;
  left: 10px;
`;

export const CanvasPlaintext: React.FC<{ onSwitch?: () => void; switchLabel?: string }> = ({
  onSwitch,
  switchLabel,
}) => {
  const { data, isLoading } = useData(CanvasLoader);
  const { t } = useTranslation();
  const [fontMultiplier, setFontMultiplier] = useState(0.7);

  useEffect(() => {
    if (!isLoading && data && !data.plaintext && onSwitch) {
      onSwitch();
    }
  }, [data, isLoading, onSwitch]);

  if (!data || !data.plaintext) {
    return null;
  }

  return (
    <PlaintextContainer>
      <PlaintextBackground>
        <PlaintextInnerContainer style={{ fontSize: `${fontMultiplier}em` }}>{data.plaintext}</PlaintextInnerContainer>
      </PlaintextBackground>
      <PlaintextActions>
        <ButtonRow>
          <Button onClick={() => setFontMultiplier(1)}>{t('atlas__zoom_home_text', { defaultValue: 'Home' })}</Button>
          <Button disabled={fontMultiplier < 0.3} onClick={() => setFontMultiplier(m => m * 0.9)}>
            {t('atlas__zoom_out_text', { defaultValue: '-' })}
          </Button>
          <Button disabled={fontMultiplier > 2.4} onClick={() => setFontMultiplier(m => m * 1.1)}>
            {t('atlas__zoom_in_text', { defaultValue: '+' })}
          </Button>
          {switchLabel && onSwitch ? <Button onClick={onSwitch}>{switchLabel}</Button> : null}
        </ButtonRow>
      </PlaintextActions>
    </PlaintextContainer>
  );
};
