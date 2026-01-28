export type PxRect = { left: number; top: number; width: number; height: number };

export const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export const makeEvenPositions = (count: number): number[] => {
  if (count <= 1) return [];
  const step = 100 / count;
  return Array.from({ length: count - 1 }, (_, i) => step * (i + 1));
};

export const normalisePositions = (positions: number[], count: number) => {
  const targetLen = Math.max(0, count - 1);
  const sorted = [...positions].sort((a, b) => a - b).slice(0, targetLen);
  return sorted.map(p => clamp(p, 0, 100));
};

export const getStops = (count: number, positions: number[]) => {
  const expectedLen = Math.max(0, count - 1);
  const inner = [...positions]
    .slice(0, expectedLen)
    .sort((a, b) => a - b)
    .map(p => clamp(p, 0, 100));
  return [0, ...inner, 100];
};

export const getRelativeRect = (container: HTMLElement, target: HTMLElement): PxRect => {
  const c = container.getBoundingClientRect();
  const t = target.getBoundingClientRect();
  return { left: t.left - c.left, top: t.top - c.top, width: t.width, height: t.height };
};

export const findCanvasPanelContentElement = (host: Element | null): HTMLElement | null => {
  if (!host) return null;

  const anyHost = host as any;
  const shadow: ShadowRoot | null | undefined = anyHost.shadowRoot;

  const selectors = ['canvas', 'img', 'video', '[data-canvas]', '[data-viewport]', '.viewport', '.canvas', '.content'];

  if (shadow) {
    for (const sel of selectors) {
      const el = shadow.querySelector(sel);
      if (el instanceof HTMLElement) return el;
    }
  }

  for (const sel of selectors) {
    const el = host.querySelector?.(sel);
    if (el instanceof HTMLElement) return el;
  }

  return host instanceof HTMLElement ? host : null;
};
