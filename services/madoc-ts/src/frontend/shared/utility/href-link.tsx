import React from 'react';
import { Link, type LinkProps } from 'react-router-dom';

type HrefLinkProps = Omit<LinkProps, 'to'> & {
  href: LinkProps['to'];
};

export const HrefLink = React.forwardRef<HTMLAnchorElement, HrefLinkProps>(({ href, ...props }, ref) => {
  return <Link ref={ref} to={href} {...props} />;
});

HrefLink.displayName = 'HrefLink';
