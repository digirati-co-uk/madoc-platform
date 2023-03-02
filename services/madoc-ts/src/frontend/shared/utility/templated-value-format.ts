export type TemplatedValue<Modifiers extends string = string> = {
  value: string;
  modifiers: Array<{ id: Modifiers; value: string }>;
};

export function templatedValueFormat<Modifiers extends string = string>(
  template: string,
  modifiers: Record<Modifiers, (value: string | null) => string> = {} as any
): TemplatedValue<Modifiers> {
  const block = { value: template, modifiers: [] } as TemplatedValue<Modifiers>;

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
