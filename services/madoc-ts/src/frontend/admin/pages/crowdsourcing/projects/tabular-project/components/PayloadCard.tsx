import React from 'react';
import { stringifyForDisplay } from '../utils';

const payloadCardStyle: React.CSSProperties = {
  border: '1px solid #d6d6d6',
  borderRadius: 4,
  background: '#fff',
  overflow: 'hidden',
};

const payloadCardHeaderStyle: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #e5e7eb',
  background: '#f8fafc',
  fontSize: 12,
  fontWeight: 600,
};

const payloadCardBodyStyle: React.CSSProperties = {
  margin: 0,
  padding: 10,
  fontSize: 12,
  lineHeight: 1.45,
  maxHeight: 320,
  overflow: 'auto',
  background: '#fff',
};

interface PayloadCardProps {
  title: string;
  value: unknown;
}

export function PayloadCard(props: PayloadCardProps) {
  const { title, value } = props;

  return (
    <div style={payloadCardStyle}>
      <div style={payloadCardHeaderStyle}>{title}</div>
      <pre style={payloadCardBodyStyle}>{stringifyForDisplay(value)}</pre>
    </div>
  );
}
