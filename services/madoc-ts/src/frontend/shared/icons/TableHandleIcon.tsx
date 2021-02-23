import React from 'react';

export const TableHandleIcon: React.FC<{ className: string } & any> = ({ className, ...props }) => (
  <div className={className} {...props}>
    <svg width="17px" height="11px" viewBox="0 0 17 11" version="1.1">
      <title>Handle</title>
      <g id="Symbols" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Compact-item" transform="translate(-10.000000, -10.000000)">
          <rect id="Rectangle" stroke="#B1B1B1" x="0.5" y="0.5" width="1197" height="29" />
          <g id="Handle" transform="translate(10.000000, 10.000000)" stroke="#979797" strokeLinecap="square">
            <line x1="16.5" y1="0.5" x2="0.5" y2="0.5" id="Line-5" />
            <line x1="16.5" y1="5.5" x2="0.5" y2="5.5" id="Line-5" />
            <line x1="16.5" y1="10.5" x2="0.5" y2="10.5" id="Line-5" />
          </g>
        </g>
      </g>
    </svg>
  </div>
);
