import type { NetConfig } from './tabular-types';

type AtlasHomeRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AtlasRuntimeWithTabularHome = {
  getRendererScreenPosition?: () =>
    | {
        width: number;
        height: number;
      }
    | undefined;
  setHomePosition?: (position?: AtlasHomeRect) => void;
  goHome?: () => void;
  setViewport?: (position: AtlasHomeRect) => void;
  updateControllerPosition?: () => void;
  transitionManager?: { stopTransition: () => void };
  updateNextFrame?: () => void;
  world?: {
    width?: number;
    height?: number;
    goHome?: () => void;
  };
};

export function fitTabularAlignment(
  runtime: AtlasRuntimeWithTabularHome | null | undefined,
  value: NetConfig | null | undefined
): boolean {
  if (!runtime?.setViewport || !value) return false;
  const position = getTabularHeadingHomeRect(runtime, value);
  const screen = runtime.getRendererScreenPosition?.();
  if (!position || !screen || screen.width <= 32) return false;

  // Leave 16 screen pixels on each side so both draggable guides remain reachable.
  const width = (position.width * screen.width) / (screen.width - 32);
  runtime.transitionManager?.stopTransition();
  runtime.setViewport({
    x: (position.width - width) / 2,
    y: position.y,
    width,
    height: (width * screen.height) / screen.width,
  });
  runtime.updateControllerPosition?.();
  runtime.updateNextFrame?.();
  return true;
}

function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function getFullWidthStartHomeRect(runtime: AtlasRuntimeWithTabularHome): AtlasHomeRect | null {
  const worldWidth = runtime.world?.width;
  const worldHeight = runtime.world?.height;
  const rendererSize = runtime.getRendererScreenPosition?.();

  if (
    !isPositiveNumber(worldWidth) ||
    !isPositiveNumber(worldHeight) ||
    !rendererSize ||
    !isPositiveNumber(rendererSize.width) ||
    !isPositiveNumber(rendererSize.height)
  ) {
    return null;
  }

  const viewportAspect = rendererSize.width / rendererSize.height;

  return {
    x: 0,
    y: 0,
    width: worldWidth,
    height: worldWidth / viewportAspect,
  };
}

function getTabularHeadingAnchor(
  runtime: AtlasRuntimeWithTabularHome,
  value: NetConfig
): { x: number; y: number } | null {
  const worldWidth = runtime.world?.width;
  const worldHeight = runtime.world?.height;
  if (!isPositiveNumber(worldWidth) || !isPositiveNumber(worldHeight)) {
    return null;
  }

  const leftPct = Number.isFinite(value.left) ? value.left : 0;
  const topPct = Number.isFinite(value.top) ? value.top : 0;

  return {
    x: (clamp(leftPct, 0, 100) / 100) * worldWidth,
    y: (clamp(topPct, 0, 100) / 100) * worldHeight,
  };
}

function getTabularHeadingHomeRect(runtime: AtlasRuntimeWithTabularHome, value: NetConfig): AtlasHomeRect | null {
  const baseHome = getFullWidthStartHomeRect(runtime);
  if (!baseHome) {
    return null;
  }

  const worldWidth = runtime.world?.width;
  const worldHeight = runtime.world?.height;
  const headingAnchor = getTabularHeadingAnchor(runtime, value);
  if (!isPositiveNumber(worldWidth) || !isPositiveNumber(worldHeight) || !headingAnchor) {
    return baseHome;
  }

  const maxX = Math.max(0, worldWidth - baseHome.width);
  const maxY = Math.max(0, worldHeight - baseHome.height);

  return {
    ...baseHome,
    x: clamp(headingAnchor.x, 0, maxX),
    y: clamp(headingAnchor.y, 0, maxY),
  };
}

export function setTabularHeadingsHomePosition(
  runtime: AtlasRuntimeWithTabularHome | null | undefined,
  value: NetConfig | null | undefined
): boolean {
  if (!runtime || !value || typeof runtime.setHomePosition !== 'function') {
    return false;
  }

  const homePosition = getTabularHeadingHomeRect(runtime, value);
  if (!homePosition) {
    return false;
  }

  runtime.setHomePosition(homePosition);
  runtime.updateNextFrame?.();
  return true;
}

export function goHomeToTabularHeadings(
  runtime: AtlasRuntimeWithTabularHome | null | undefined,
  value: NetConfig | null | undefined
): boolean {
  if (!setTabularHeadingsHomePosition(runtime, value) || !runtime) {
    return false;
  }

  if (typeof runtime.goHome === 'function') {
    runtime.goHome();
  } else {
    runtime.world?.goHome?.();
  }

  runtime.updateNextFrame?.();
  return true;
}
