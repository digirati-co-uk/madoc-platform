export function rgbToHex(color: { r: number; g: number; b: number }): string {
  const r = color.r.toString(16).padStart(2, '0');
  const g = color.g.toString(16).padStart(2, '0');
  const b = color.b.toString(16).padStart(2, '0');

  return '#' + r + g + b;
}

export function maybeRGBA({
  r,
  g,
  b,
  a = 1,
}: {
  r: string;
  b: string;
  g: string;
  a?: string | number;
}): { r: number; g: number; b: number; a: number } {
  const rNum = Number(r);
  const gNum = Number(g);
  const bNum = Number(b);
  const aNum = Number(a);

  if (Number.isNaN(rNum) || Number.isNaN(gNum) || Number.isNaN(bNum)) {
    throw new Error(`Invalid color rgb(${r}, ${g}, ${b})`);
  }

  return {
    r: rNum,
    g: gNum,
    b: bNum,
    a: Number.isNaN(aNum) ? 1 : aNum,
  };
}

export function parseRGBA(_color: string): { r: number; g: number; b: number; a: number } {
  const color = _color.trim();
  const sep = color.indexOf(',') > -1 ? ',' : ' ';
  const [r, g, b, a = 1] = color
    .substr(color.indexOf('rgba') === -1 ? 4 : 5)
    .split(')')[0]
    .split(sep);

  return maybeRGBA({ r, g, b, a });
}

export function parseHex(color: string): { r: number; g: number; b: number; a: number } {
  let r = '0';
  let g = '0';
  let b = '0';

  // 3 digits
  if (color.length === 4) {
    r = '0x' + color[1] + color[1];
    g = '0x' + color[2] + color[2];
    b = '0x' + color[3] + color[3];

    // 6 digits
  } else if (color.length === 7) {
    r = '0x' + color[1] + color[2];
    g = '0x' + color[3] + color[4];
    b = '0x' + color[5] + color[6];
  }

  return maybeRGBA({ r, g, b });
}

export function hexOpacityToRGBA({ opacity, color }: { opacity: number; color: string }): string {
  const { r, g, b } = parseHex(color);

  if (opacity >= 1) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export function RGBAToHexOpacity(rgba: string): { opacity: number; color: string } {
  const parsed = parseRGBA(rgba);

  return {
    color: rgbToHex(parsed),
    opacity: parsed.a,
  };
}

export function parseColor(
  _color: string,
  fallback = { r: 0, g: 0, b: 0, a: 1 }
): { r: number; g: number; b: number; a: number } {
  try {
    const color = _color.trim();
    if (color[0] === '#') {
      return parseHex(_color);
    }
    return parseRGBA(_color);
  } catch (e) {
    return fallback;
  }
}

export function stringifyColor({ r, g, b, a }: { r: number; g: number; b: number; a?: number }): string {
  if (typeof a !== 'undefined' && a < 1) {
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  return rgbToHex({ r, g, b });
}
