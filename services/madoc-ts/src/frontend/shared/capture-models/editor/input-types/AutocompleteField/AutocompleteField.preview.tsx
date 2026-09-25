import React from 'react';
import { AutocompleteFieldProps } from './AutocompleteField';

export const AutocompleteFieldPreview: React.FC<AutocompleteFieldProps> = ({ value }) => {
  if (!value) {
    return <span className="text-slate-500">No value</span>;
  }

  return (
    <div className="min-w-0">
      {value.uri ? (
        <a className="font-medium text-[var(--madoc-accent-link,#4265e9)] underline" href={value.uri}>
          {value.label}
        </a>
      ) : (
        <strong>{value.label}</strong>
      )}
      {value.resource_class ? <div className="text-xs text-slate-500">{value.resource_class}</div> : null}
    </div>
  );
};
