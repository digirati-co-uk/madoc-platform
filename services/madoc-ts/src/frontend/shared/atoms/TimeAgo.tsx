import React, { useState } from 'react';
import _ReactTimeago from 'react-timeago';
import { useLocalStorage } from '../hooks/use-local-storage';

export const TimeAgoInternal: typeof _ReactTimeago = (_ReactTimeago as any).default || _ReactTimeago;

export function TimeAgo(props: _ReactTimeago.ReactTimeagoProps<any>) {
  const [isNormal, setIsNormal] = useLocalStorage('date-format', false);
  const onClick = () => {
    setIsNormal(t => !t);
  };

  const formatted = isNormal
    ? `${new Date(props.date).toLocaleDateString()} ${new Date(props.date).toLocaleTimeString()} `
    : null;

  return <span onClick={onClick}>{formatted ? formatted : <TimeAgoInternal {...props} />}</span>;
}
