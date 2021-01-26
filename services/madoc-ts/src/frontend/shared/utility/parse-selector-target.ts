export default function parseSelectorTarget(toParse: string, scale = 1) {
  if (!toParse) {
    return toParse;
  }
  const W3C_SELECTOR = /[#&?](xywh=)?(pixel:|percent:)?([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?),([0-9]+(?:\.[0-9]+)?)/;
  const match = W3C_SELECTOR.exec(toParse);

  if (match) {
    return {
      unit: match[2] === 'percent:' ? 'percent' : 'pixel',
      scale,
      expanded: true,
      x: parseFloat(match[3]) * scale,
      y: parseFloat(match[4]) * scale,
      width: parseFloat(match[5]) * scale,
      height: parseFloat(match[6]) * scale,
      toString() {
        // @todo maybe something else?
        return toParse.split('#')[0];
      },
    };
  }
  return toParse;
}
