import React, { useContext } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { LinkTargetContext } from './link-targets';

type HrefLinkProps = Omit<LinkProps, 'to'> & {
  href: LinkProps['to'];
};

export const HrefLink = React.forwardRef<HTMLAnchorElement, HrefLinkProps>(({ href, ...props }, ref) => {
  const openInNewTab = useContext(LinkTargetContext);
  return (
    <Link
      ref={ref}
      to={href}
      {...props}
      target={props.target || (openInNewTab ? '_blank' : undefined)}
      rel={openInNewTab ? `${props.rel || ''} noopener noreferrer`.trim() : props.rel}
    />
  );
});

HrefLink.displayName = 'HrefLink';
