import React from 'react';

export type SelectRef = {
  blur?: () => void;
  focus?: () => void;
  clearValue?: () => void;
};

export const Select = React.forwardRef<SelectRef, Record<string, unknown>>(function ServerSelect(_props, _ref) {
  // Server bundle shim: UI-only control, rendered on client after hydration.
  return null;
});

export default Select;
