let supports: undefined | boolean = undefined;

export function webglSupport() {
  if (typeof supports === 'undefined')
    try {
      const canvas = document.createElement('canvas');
      supports = !!(!!window.WebGLRenderingContext && canvas.getContext('webgl2'));
    } catch (e) {
      supports = false;
    }

  return supports;
}
