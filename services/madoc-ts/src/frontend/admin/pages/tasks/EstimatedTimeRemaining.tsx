import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatEta } from '../../../shared/utility/estimated-time-remaining';

export function EstimatedTimeRemaining({ seconds }: { seconds: number | null }) {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(seconds === null ? null : Math.ceil(seconds));

  useEffect(() => {
    if (seconds === null) {
      setRemainingSeconds(null);
      return;
    }

    const deadline = Date.now() + seconds * 1000;
    const updateRemaining = () => setRemainingSeconds(Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [seconds]);

  return (
    <p className="mt-2 text-sm text-slate-700">
      {remainingSeconds === null
        ? t('Estimating time remaining')
        : t('Estimated time remaining: {{time}}', { time: formatEta(remainingSeconds) })}
    </p>
  );
}
