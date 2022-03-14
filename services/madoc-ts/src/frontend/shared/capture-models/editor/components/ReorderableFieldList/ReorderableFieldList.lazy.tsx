import React from 'react';

export const ReorderableFieldList = React.lazy(() =>
  import(/* webpackChunkName: "choice-list" */ './ReorderableFieldList')
);
