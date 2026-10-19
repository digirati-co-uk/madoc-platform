import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonRow } from '../../../shared/navigation/Button';
import { useLocalStorage } from '../../../shared/hooks/use-local-storage';

interface CanvasPlaintextProps {
  plaintext: string;
  onSwitch?: () => void;
  switchLabel?: string;
}

export function CanvasPlaintext({ plaintext, onSwitch, switchLabel }: CanvasPlaintextProps) {
  const { t } = useTranslation();
  const [fontMultiplier, setFontMultiplier] = useLocalStorage('text-zoom', 0.9);

  useEffect(() => {
    if (!plaintext && onSwitch) onSwitch();
  }, [plaintext, onSwitch]);

  if (!plaintext) return null;

  return (
    <div className="bg-white">
      <div className="sticky top-0 bg-white p-2">
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
      </div>
      <div className="flex justify-around">
        <div
          className="max-w-full whitespace-pre-wrap break-words p-4 leading-[1.4em]"
          style={{ fontSize: `${fontMultiplier}em` }}
        >
          {plaintext}
        </div>
      </div>
    </div>
  );
}
