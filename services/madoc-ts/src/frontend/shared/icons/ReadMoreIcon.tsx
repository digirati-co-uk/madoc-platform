import * as React from 'react';

export function ReadMoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg height="1em" viewBox="0 0 24 24" width="1em" {...props}>
      <path fill="none" d="M0 0h24v24H0z" />
      <path d="M13 7h9v2h-9zM13 15h9v2h-9zM16 11h6v2h-6zM13 12L8 7v4H2v2h6v4z" />
    </svg>
  );
}
