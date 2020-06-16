import React from 'react';
import { Link } from 'react-router-dom';

export const HrefLink: React.FC<any> = ({ href, ...props }) => {
  return <Link to={href} {...props} />;
};
