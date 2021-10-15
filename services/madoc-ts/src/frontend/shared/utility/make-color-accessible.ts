import contrast from 'contrast';

export function makeColorAccessible(background: string) {
  if (contrast(background) === 'light') {
    return '#000';
  }
  return '#fff';
}
