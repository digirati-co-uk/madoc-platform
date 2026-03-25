type AtlasViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type AtlasRuntimeLike = {
  getViewport?: () => AtlasViewport | null | undefined;
  setViewport?: (next: AtlasViewport) => void;
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

function hasValidViewport(viewport: AtlasViewport | null | undefined): viewport is AtlasViewport {
  if (!viewport) {
    return false;
  }

  return (
    Number.isFinite(viewport.x) &&
    Number.isFinite(viewport.y) &&
    Number.isFinite(viewport.width) &&
    Number.isFinite(viewport.height) &&
    viewport.width > 0 &&
    viewport.height > 0
  );
}

export function resizeAtlasRuntime(
  runtime: AtlasRuntimeLike | null | undefined,
  size: { width: number; height: number }
) {
  if (!runtime) {
    return;
  }

  const canPreserveViewport = typeof runtime.getViewport === 'function' && typeof runtime.setViewport === 'function';
  const viewportBeforeResize = canPreserveViewport ? runtime.getViewport() : null;

  runtime.updateRendererScreenPosition?.();

  if (runtime.renderer?.resize) {
    runtime.renderer.resize(size.width, size.height);
  } else if (typeof runtime.resize === 'function') {
    runtime.resize(size.width, size.height);
  }

  if (canPreserveViewport && hasValidViewport(viewportBeforeResize)) {
    runtime.setViewport({
      x: viewportBeforeResize.x,
      y: viewportBeforeResize.y,
      width: viewportBeforeResize.width,
      height: viewportBeforeResize.height,
    });
  }

  runtime.updateNextFrame?.();
}
