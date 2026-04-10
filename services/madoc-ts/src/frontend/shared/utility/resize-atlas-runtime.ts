type AtlasRuntimeLike = {
  getViewport?: () =>
    | {
        x: number;
        y: number;
        width: number;
        height: number;
      }
    | null
    | undefined;
  setViewport?: (next: { x: number; y: number; width: number; height: number }) => void;
  getRendererScreenPosition?: () =>
    | {
        width: number;
        height: number;
      }
    | undefined;
  updateRendererScreenPosition?: () => void;
  updateControllerPosition?: () => void;
  updateNextFrame?: () => void;
  renderer?: {
    resize?: (width?: number, height?: number) => void;
  };
  resize?: {
    (): void;
    (width?: number, height?: number): void;
    (fromWidth: number, toWidth: number, fromHeight: number, toHeight: number): void;
  };
  world?: {
    width?: number;
    height?: number;
  };
};

type AtlasViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isPositiveNumber(value: unknown): value is number {
  return isFiniteNumber(value) && value > 0;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function toViewport(value: AtlasViewport | null | undefined): AtlasViewport | null {
  if (!value) {
    return null;
  }

  if (
    !isFiniteNumber(value.x) ||
    !isFiniteNumber(value.y) ||
    !isPositiveNumber(value.width) ||
    !isPositiveNumber(value.height)
  ) {
    return null;
  }

  return {
    x: value.x,
    y: value.y,
    width: value.width,
    height: value.height,
  };
}

export function resizeAtlasRuntime(
  runtime: AtlasRuntimeLike | null | undefined,
  size: { width: number; height: number }
) {
  if (!runtime) {
    return;
  }

  const previousRendererSize = runtime.getRendererScreenPosition?.();
  const previousViewport = toViewport(runtime.getViewport?.());
  const hasRuntimeResize = typeof runtime.resize === 'function';
  const canUseFromToResize =
    !!previousRendererSize &&
    Number.isFinite(previousRendererSize.width) &&
    Number.isFinite(previousRendererSize.height) &&
    previousRendererSize.width > 0 &&
    previousRendererSize.height > 0 &&
    size.width > 0 &&
    size.height > 0;

  if (
    canUseFromToResize &&
    previousRendererSize &&
    Math.abs(previousRendererSize.width - size.width) < 0.5 &&
    Math.abs(previousRendererSize.height - size.height) < 0.5
  ) {
    return;
  }

  const canPreserveViewport =
    !!previousViewport &&
    !!previousRendererSize &&
    isPositiveNumber(previousRendererSize.width) &&
    isPositiveNumber(previousRendererSize.height) &&
    isPositiveNumber(size.width) &&
    isPositiveNumber(size.height) &&
    typeof runtime.setViewport === 'function';

  if (canPreserveViewport && previousViewport && previousRendererSize && runtime.setViewport) {
    // Avoid runtime.resize(), which recenters using focal/home during each drag step.
    runtime.renderer?.resize?.(size.width, size.height);
    runtime.updateRendererScreenPosition?.();

    const widthRatio = size.width / previousRendererSize.width;
    const heightRatio = size.height / previousRendererSize.height;

    if (isPositiveNumber(widthRatio) && isPositiveNumber(heightRatio)) {
      const previousCenterX = previousViewport.x + previousViewport.width / 2;
      const previousCenterY = previousViewport.y + previousViewport.height / 2;
      const nextViewportWidth = previousViewport.width * widthRatio;
      const nextViewportHeight = previousViewport.height * heightRatio;

      if (isPositiveNumber(nextViewportWidth) && isPositiveNumber(nextViewportHeight)) {
        let nextX = previousCenterX - nextViewportWidth / 2;
        let nextY = previousCenterY - nextViewportHeight / 2;

        const worldWidth = runtime.world?.width;
        const worldHeight = runtime.world?.height;
        if (isPositiveNumber(worldWidth) && isPositiveNumber(worldHeight)) {
          if (nextViewportWidth > worldWidth) {
            nextX = (worldWidth - nextViewportWidth) / 2;
          } else {
            nextX = clamp(nextX, 0, worldWidth - nextViewportWidth);
          }

          if (nextViewportHeight > worldHeight) {
            nextY = (worldHeight - nextViewportHeight) / 2;
          } else {
            nextY = clamp(nextY, 0, worldHeight - nextViewportHeight);
          }
        }

        runtime.setViewport({
          x: nextX,
          y: nextY,
          width: nextViewportWidth,
          height: nextViewportHeight,
        });
        runtime.updateControllerPosition?.();
      }
    }

    runtime.updateNextFrame?.();
    return;
  }

  if (hasRuntimeResize) {
    if (canUseFromToResize && previousRendererSize) {
      runtime.resize(previousRendererSize.width, size.width, previousRendererSize.height, size.height);
    } else {
      const resizeArity = runtime.resize.length;
      if (resizeArity <= 2) {
        runtime.resize(size.width, size.height);
      } else if (runtime.renderer?.resize) {
        runtime.renderer.resize(size.width, size.height);
      } else {
        runtime.resize();
      }
    }
  } else if (runtime.renderer?.resize) {
    runtime.renderer.resize(size.width, size.height);
  }

  runtime.updateRendererScreenPosition?.();
  runtime.updateNextFrame?.();
}
