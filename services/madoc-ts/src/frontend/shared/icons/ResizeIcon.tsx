import * as React from 'react';
import { SVGProps } from 'react';
export const ResizeIcon = (props: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 -960 960 960" {...props}>
    <path
      fill="currentColor"
      d="M280-320 120-480l160-160 43 43-88 87h490l-87-88 42-42 160 160-160 160-42-42 87-88-490 1 87 87-42 42Z"
    />
  </svg>
);
