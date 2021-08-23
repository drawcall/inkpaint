import CanvasRenderer from "./renderers/canvas/CanvasRenderer";
import WebGLRenderer from "./renderers/webgl/WebGLRenderer";

export function autoRenderer(options) {
  const forceCanvas = options && options.forceCanvas;
  if (!forceCanvas) {
    return new WebGLRenderer(options);
  }

  return new CanvasRenderer(options);
}
