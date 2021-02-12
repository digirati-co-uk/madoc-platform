import React from 'react';
import { HrefLink } from '../../shared/utility/href-link';

export const Homepage: React.FC = () => {
  return (
    <div>
      <h1>Homepage</h1>
      <p>We are working on features for customising the homepage.</p>
      <ul>
        <li>
          <HrefLink href="/collections">All collections</HrefLink>
        </li>
        <li>
          <HrefLink href="/projects">All projects</HrefLink>
        </li>
        <li>
          <HrefLink href="/manifests">All manifests</HrefLink>
        </li>
        <li>
          <HrefLink href="/dashboard">User dashboard (login required)</HrefLink>
        </li>
      </ul>
    </div>
  );
};
