type AtlasRuntimeLike = {
  getRendererScreenPosition?: () =>
    | {
        width: number;
        height: number;
      }
    | undefined;
  updateRendererScreenPosition?: () => void;
  updateNextFrame?: () => void;
  renderer?: {
    resize?: (width?: number, height?: number) => void;
  };
  resize?: {
    (): void;
    (width?: number, height?: number): void;
    (fromWidth: number, toWidth: number, fromHeight: number, toHeight: number): void;
  };
};

export function resizeAtlasRuntime(
  runtime: AtlasRuntimeLike | null | undefined,
  size: { width: number; height: number }
) {
  if (!runtime) {
    return;
  }

  const previousRendererSize = runtime.getRendererScreenPosition?.();
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

  if (hasRuntimeResize) {
    if (canUseFromToResize && previousRendererSize) {
      runtime.resize(previousRendererSize.width, size.width, previousRendererSize.height, size.height);
    } else {
      runtime.resize(size.width, size.height);
    }
  } else if (runtime.renderer?.resize) {
    runtime.renderer.resize(size.width, size.height);
  }

  runtime.updateRendererScreenPosition?.();
  runtime.updateNextFrame?.();
}
