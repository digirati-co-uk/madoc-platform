// eslint-disable-next-line no-unused-vars
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

export default function UXPinWrapper({ children }) {
  return React.createElement(MemoryRouter, {}, [children]);
}
