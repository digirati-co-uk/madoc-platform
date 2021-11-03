import React from 'react';
import { Link } from 'react-router-dom';

export const HrefLink: React.FC<any> = React.forwardRef(({ href, ...props }, ref) => {
  return <Link ref={ref} to={href} {...props} />;
});

HrefLink.displayName = 'HrefLink';
