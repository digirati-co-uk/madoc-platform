import React from 'react';
import { SiteBlock } from '../../../types/schemas/site-page';
import { useBlockDetails } from './block-editor';

export const BlockLabel: React.FC<{ block: SiteBlock }> = ({ block }) => {
  const { label } = useBlockDetails(block);

  return <>{label}</>;
};
