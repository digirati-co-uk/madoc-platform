import * as React from 'react';
import { SVGProps } from 'react';

const FlagIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
    <path
      fill="currentColor"
      d="M7 13v8q0 .425-.288.713T6 22t-.712-.288T5 21V4q0-.425.288-.712T6 3h13.525q.275 0 .488.125t.337.325.162.438-.062.487L19 8l1.45 3.625q.1.25.063.488t-.163.437-.337.325-.488.125z"
    />
  </svg>
);
export default FlagIcon;
