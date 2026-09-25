function colorLuminance(rgb: number[]) {
  return rgb.reduce((total, value, index) => {
    const channel = value / 255;
    const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    return total + linear * [0.2126, 0.7152, 0.0722][index];
  }, 0);
}

function colorChannels(hex: string) {
  const fullHex = hex.length === 4 ? `#${[1, 2, 3].map(index => hex[index] + hex[index]).join('')}` : hex;
  return [1, 3, 5].map(index => parseInt(fullHex.slice(index, index + 2), 16));
}

export function makeColorAccessible(background: string) {
  return colorLuminance(colorChannels(background)) > 0.179 ? '#000' : '#fff';
}

export function makeAccentLinkColor(accent: string) {
  const channels = colorChannels(accent);

  while (colorLuminance(channels) > 0.1833) {
    channels.forEach((value, index) => (channels[index] = Math.floor(value * 0.9)));
  }

  return `#${channels.map(value => value.toString(16).padStart(2, '0')).join('')}`;
}

export function accentCssVariables(configuredAccent?: string) {
  const accent = configuredAccent && /^#[0-9a-f]{6}$/i.test(configuredAccent) ? configuredAccent : '#4265e9';
  const selected = `#${colorChannels(accent)
    .map(value =>
      Math.round(value * 0.8)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
  return `:root { --madoc-accent: ${accent}; --madoc-accent-text: ${makeColorAccessible(accent)}; --madoc-accent-link: ${makeAccentLinkColor(accent)}; --madoc-accent-selected: ${selected}; --madoc-accent-selected-text: ${makeColorAccessible(selected)}; --madoc-accent-divider: color-mix(in srgb, var(--madoc-accent-text) 35%, transparent); }
    @supports (color: contrast-color(red)) { :root { --madoc-accent-text: contrast-color(var(--madoc-accent)); --madoc-accent-selected-text: contrast-color(var(--madoc-accent-selected)); } }`;
}
