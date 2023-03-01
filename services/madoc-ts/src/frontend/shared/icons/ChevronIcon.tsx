import { SVGProps } from 'react';
import * as React from 'react';

export const ChevronRight = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 96 960 960" width="1em" {...props}>
    <path d="m304 974-56-57 343-343-343-343 56-57 400 400-400 400Z" />
  </svg>
);

export const ChevronLeft = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 96 960 960" width="1em" {...props}>
    <path d="M400 976 0 576l400-400 56 57-343 343 343 343-56 57Z" />
  </svg>
);

export const ChevronDown = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" height="1em" width="1em" {...props}>
    <path d="M24 24H0V0h24v24z" fill="none" />
    <path d="M16.59 8.59 12 13.17 7.41 8.59 6 10l6 6 6-6-1.41-1.41z" />
  </svg>
);
