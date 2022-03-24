export function templatedValueFormat<Modifiers extends string = string>(
  template: string,
  modifiers: Record<Modifiers, (value: string | null) => string> = {} as any
) {
  const block = { value: template, modifiers: [] } as {
    value: string;
    modifiers: Array<{ id: Modifiers; value: string }>;
  };

  block.value = template
    .replace(/ ?{(.+?)(\/(.+?))?}/g, (substring, property, _, defaultPropertyLabel) => {
      const modifier: Modifiers = (property || '').slice(1);
      if (!modifier) {
        return '';
      }

      block.modifiers.push({ id: modifier, value: defaultPropertyLabel });

      if (modifiers[modifier]) {
        return modifiers[modifier](defaultPropertyLabel || '');
      }

      return '';
    })
    .trim();

  return block;
}
