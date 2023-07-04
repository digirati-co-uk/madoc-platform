import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Button, ButtonRow } from '../../shared/navigation/Button';
import { useData } from '../../shared/hooks/use-data';
import { useLocalStorage } from '../../shared/hooks/use-local-storage';
import { CanvasLoader } from '../pages/loaders/canvas-loader';

const PlaintextContainer = styled.div``;

const PlaintextBackground = styled.div`
  background: #fff;
  display: flex;
  justify-content: space-around;
`;

const PlaintextInnerContainer = styled.div`
  background: #fff;
  white-space: pre-wrap;
  width: auto;
  padding: 1em;
  font-size: 0.9em;
  line-height: 1.4em;
  max-width: 100%;
`;

const PlaintextActions = styled.div`
  background: #fff;
  position: sticky;
  top: 0;
  padding: 0.5em;
`;

export const CanvasPlaintext: React.FC<{ onSwitch?: () => void; switchLabel?: string }> = ({
  onSwitch,
  switchLabel,
}) => {
  const { data, isLoading } = useData(CanvasLoader);
  const { t } = useTranslation();
  const [fontMultiplier, setFontMultiplier] = useLocalStorage('text-zoom', 0.9);

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
      <PlaintextActions>
        <ButtonRow $noMargin>
          <Button onClick={() => setFontMultiplier(0.9)}>
            {t('atlas__zoom_home_text', { defaultValue: 'Reset' })}
          </Button>
          <Button disabled={fontMultiplier < 0.3} onClick={() => setFontMultiplier(m => m * 0.9)}>
            {t('atlas__zoom_out_text', { defaultValue: '-' })}
          </Button>
          <Button disabled={fontMultiplier > 2.4} onClick={() => setFontMultiplier(m => m * 1.1)}>
            {t('atlas__zoom_in_text', { defaultValue: '+' })}
          </Button>
          {switchLabel && onSwitch ? <Button onClick={onSwitch}>{switchLabel}</Button> : null}
        </ButtonRow>
      </PlaintextActions>
      <PlaintextBackground>
        <PlaintextInnerContainer style={{ fontSize: `${fontMultiplier}em` }}>{data.plaintext}</PlaintextInnerContainer>
      </PlaintextBackground>
    </PlaintextContainer>
  );
};
