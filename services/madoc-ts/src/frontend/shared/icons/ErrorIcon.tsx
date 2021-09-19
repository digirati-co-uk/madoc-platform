import React from 'react';

export const ErrorIcon: React.FC<{ inline?: boolean; height?: number; className?: string }> = ({
  className,
  inline,
  height = 20,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height={height}
    viewBox="0 0 24 24"
    width="24"
    style={{ verticalAlign: inline ? 'bottom' : undefined }}
    className={className}
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <path
      fill="#ec3941"
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
    />
  </svg>
);
