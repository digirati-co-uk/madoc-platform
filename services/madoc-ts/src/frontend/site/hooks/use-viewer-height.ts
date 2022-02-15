import useMatchMedia from 'use-match-media-hook';

export function useViewerHeight() {
  const [is900, is1050, is1200] = useMatchMedia(['(min-width: 900px)', '(min-width: 1050px)', '(min-width: 1200px)']);

  if (is1200) {
    return '80vh';
  }

  if (is1050) {
    return '85vh';
  }

  if (is900) {
    return '90vh';
  }

  return '85vh';
}
