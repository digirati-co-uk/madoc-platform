import React from 'react';

export const convertComponentToText = (children: any) => {
  let text = '';

  React.Children.map(children, child => {
    if (typeof child === 'string') {
      text += child;
    }
  });

  return text;
};
