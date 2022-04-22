import React, { SVGProps } from 'react';

export const HomeIcon = ({ title, ...props }: SVGProps<SVGSVGElement> & { title?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="1em" viewBox="0 0 24 24" {...props}>
    <path d="M0 0h24v24H0z" fill="none" />
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor" />
    {title ? <title>{title}</title> : null}
  </svg>
);
