import React from 'react';
import { TagDefinition } from './TaggedTextField';

type Props = {
  preset: string; // bentham
  blocks?: TagDefinition[];
  inline?: TagDefinition[];
  enableLineBreak?: boolean;
  enablePageBreak?: boolean;
  enableIllegible?: boolean;
};

const TaggedTextFieldEditor: React.FC<Props> = ({ children, ...props }) => {
  // CSV to start with:
  // tag,label,color,bg = <span class="{tag}" title="{label}" />
  return null;
};

export default TaggedTextFieldEditor;
