import * as React from 'react';
import { SVGProps } from 'react';

const ResizeHandleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props} style={{ transform: 'rotate(90deg)' }}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M20 9H4v2h16V9zM4 15h16v-2H4v2z" />
  </svg>
);

export default ResizeHandleIcon;
