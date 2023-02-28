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
