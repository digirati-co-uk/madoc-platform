import { useLayoutEffect } from 'react';

export const useBrowserLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : () => {};
