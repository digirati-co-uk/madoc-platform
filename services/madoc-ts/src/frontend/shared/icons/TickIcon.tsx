import React from 'react';

export const TickIcon = (props: any) => (
  <svg
    width="24px"
    height="20px"
    viewBox="0 0 24 12"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <g transform="translate(2, -4)">
      <polygon
        fill="#29A745"
        fillRule="nonzero"
        points="7.5 13.5 4 10 2.83333333 11.1666667 7.5 15.8333333 17.5 5.83333333 16.3333333 4.66666667"
      />
    </g>
  </svg>
);

export const WhiteTickIcon = (props: any) => (
  <svg
    width="24px"
    height="20px"
    viewBox="0 0 24 12"
    version="1.1"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    {...props}
  >
    <g transform="translate(2, -4)">
      <polygon
        fillRule="nonzero"
        points="7.5 13.5 4 10 2.83333333 11.1666667 7.5 15.8333333 17.5 5.83333333 16.3333333 4.66666667"
        fill="currentColor"
      />
    </g>
  </svg>
);
