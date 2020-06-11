import React from 'react';
import { LocaleString } from '../../shared/components/LocaleString';

export const ViewProject: React.FC<{ project: any }> = ({ project }) => {
  return <LocaleString as={'h1'}>{project.label}</LocaleString>;
};
