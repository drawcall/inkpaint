import CanvasRenderer from "../../renderers/canvas/CanvasRenderer";
import { SHAPES } from "../../const";

export default class CanvasGraphicsRenderer {
  constructor(renderer) {
    this.renderer = renderer;
  }

  render(graphics) {
    const renderer = this.renderer;
    const context = renderer.context;
    const worldAlpha = graphics.worldAlpha;
    const transform = graphics.transform.worldTransform;
    const resolution = renderer.resolution;

    context.setTransform(
      transform.a * resolution,
      transform.b * resolution,
      transform.c * resolution,
      transform.d * resolution,
      transform.tx * resolution,
      transform.ty * resolution
    );

    // update tint if graphics was dirty
    if (
      graphics.canvasTintDirty !== graphics.dirty ||
      graphics._prevTint !== graphics.tint
    ) {
      this.updateGraphicsTint(graphics);
    }

    renderer.setBlendMode(graphics.blendMode);

    for (let i = 0; i < graphics.graphicsData.length; i++) {
      const data = graphics.graphicsData[i];
      const shape = data.shape;

      const fillColor = data._fillTint;
      const lineColor = data._lineTint;

      context.lineWidth = data.lineWidth;

      if (data.type === SHAPES.POLY) {
        context.beginPath();

        let points = shape.points;
        const holes = data.holes;
        let outerArea;
        let innerArea;
        let px;
        let py;

        context.moveTo(points[0], points[1]);

        for (let j = 2; j < points.length; j += 2) {
          context.lineTo(points[j], points[j + 1]);
        }

        // if the first and last point are the same close the path - much neater :)
        if (shape.closed) {
          context.closePath();
        }

        if (holes.length > 0) {
          outerArea = 0;
          px = points[0];
          py = points[1];
          for (let j = 2; j + 2 < points.length; j += 2) {
            outerArea +=
              (points[j] - px) * (points[j + 3] - py) -
              (points[j + 2] - px) * (points[j + 1] - py);
          }

          for (let k = 0; k < holes.length; k++) {
            points = holes[k].points;

            if (!points) {
              continue;
            }

            innerArea = 0;
            px = points[0];
            py = points[1];
            for (let j = 2; j + 2 < points.length; j += 2) {
              innerArea +=
                (points[j] - px) * (points[j + 3] - py) -
                (points[j + 2] - px) * (points[j + 1] - py);
            }

            if (innerArea * outerArea < 0) {
              context.moveTo(points[0], points[1]);

              for (let j = 2; j < points.length; j += 2) {
                context.lineTo(points[j], points[j + 1]);
              }
            } else {
              context.moveTo(
                points[points.length - 2],
                points[points.length - 1]
              );

              for (let j = points.length - 4; j >= 0; j -= 2) {
                context.lineTo(points[j], points[j + 1]);
              }
            }

            if (holes[k].close) {
              context.closePath();
            }
          }
        }

        if (data.fill) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = `#${`00000${(fillColor | 0).toString(16)}`.substr(
            -6
          )}`;
          context.fill();
        }
        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.strokeStyle = `#${`00000${(lineColor | 0).toString(
            16
          )}`.substr(-6)}`;
          context.stroke();
        }
      } else if (data.type === SHAPES.RECT) {
        if (data.fillColor || data.fillColor === 0) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = `#${`00000${(fillColor | 0).toString(16)}`.substr(
            -6
          )}`;
          context.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.strokeStyle = `#${`00000${(lineColor | 0).toString(
            16
          )}`.substr(-6)}`;
          context.strokeRect(shape.x, shape.y, shape.width, shape.height);
        }
      } else if (data.type === SHAPES.CIRC) {
        // TODO - need to be Undefined!
        context.beginPath();
        context.arc(shape.x, shape.y, shape.radius, 0, 2 * Math.PI);
        context.closePath();

        if (data.fill) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = `#${`00000${(fillColor | 0).toString(16)}`.substr(
            -6
          )}`;
          context.fill();
        }
        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.strokeStyle = `#${`00000${(lineColor | 0).toString(
            16
          )}`.substr(-6)}`;
          context.stroke();
        }
      } else if (data.type === SHAPES.ELIP) {
        // ellipse code taken from: http://stackoverflow.com/questions/2172798/how-to-draw-an-oval-in-html5-canvas

        const w = shape.width * 2;
        const h = shape.height * 2;

        const x = shape.x - w / 2;
        const y = shape.y - h / 2;

        context.beginPath();

        const kappa = 0.5522848;
        const ox = (w / 2) * kappa; // control point offset horizontal
        const oy = (h / 2) * kappa; // control point offset vertical
        const xe = x + w; // x-end
        const ye = y + h; // y-end
        const xm = x + w / 2; // x-middle
        const ym = y + h / 2; // y-middle

        context.moveTo(x, ym);
        context.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
        context.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
        context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
        context.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);

        context.closePath();

        if (data.fill) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = `#${`00000${(fillColor | 0).toString(16)}`.substr(
            -6
          )}`;
          context.fill();
        }
        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.strokeStyle = `#${`00000${(lineColor | 0).toString(
            16
          )}`.substr(-6)}`;
          context.stroke();
        }
      } else if (data.type === SHAPES.RREC) {
        const rx = shape.x;
        const ry = shape.y;
        const width = shape.width;
        const height = shape.height;
        let radius = shape.radius;

        const maxRadius = (Math.min(width, height) / 2) | 0;

        radius = radius > maxRadius ? maxRadius : radius;

        context.beginPath();
        context.moveTo(rx, ry + radius);
        context.lineTo(rx, ry + height - radius);
        context.quadraticCurveTo(rx, ry + height, rx + radius, ry + height);
        context.lineTo(rx + width - radius, ry + height);
        context.quadraticCurveTo(
          rx + width,
          ry + height,
          rx + width,
          ry + height - radius
        );
        context.lineTo(rx + width, ry + radius);
        context.quadraticCurveTo(rx + width, ry, rx + width - radius, ry);
        context.lineTo(rx + radius, ry);
        context.quadraticCurveTo(rx, ry, rx, ry + radius);
        context.closePath();

        if (data.fillColor || data.fillColor === 0) {
          context.globalAlpha = data.fillAlpha * worldAlpha;
          context.fillStyle = `#${`00000${(fillColor | 0).toString(16)}`.substr(
            -6
          )}`;
          context.fill();
        }

        if (data.lineWidth) {
          context.globalAlpha = data.lineAlpha * worldAlpha;
          context.strokeStyle = `#${`00000${(lineColor | 0).toString(
            16
          )}`.substr(-6)}`;
          context.stroke();
        }
      }
    }
  }

  /**
   * Updates the tint of a graphics object
   *
   * @private
   * @param {InkPaint.Graphics} graphics - the graphics that will have its tint updated
   */
  updateGraphicsTint(graphics) {
    graphics._prevTint = graphics.tint;
    graphics.canvasTintDirty = graphics.dirty;

    const tintR = ((graphics.tint >> 16) & 0xff) / 255;
    const tintG = ((graphics.tint >> 8) & 0xff) / 255;
    const tintB = (graphics.tint & 0xff) / 255;

    for (let i = 0; i < graphics.graphicsData.length; ++i) {
      const data = graphics.graphicsData[i];

      const fillColor = data.fillColor | 0;
      const lineColor = data.lineColor | 0;

      // super inline, cos optimization :)
      data._fillTint =
        (((((fillColor >> 16) & 0xff) / 255) * tintR * 255) << 16) +
        (((((fillColor >> 8) & 0xff) / 255) * tintG * 255) << 8) +
        ((fillColor & 0xff) / 255) * tintB * 255;

      data._lineTint =
        (((((lineColor >> 16) & 0xff) / 255) * tintR * 255) << 16) +
        (((((lineColor >> 8) & 0xff) / 255) * tintG * 255) << 8) +
        ((lineColor & 0xff) / 255) * tintB * 255;
    }
  }

  renderPolygon(points, close, context) {
    context.moveTo(points[0], points[1]);

    for (let j = 1; j < points.length / 2; ++j) {
      context.lineTo(points[j * 2], points[j * 2 + 1]);
    }

    if (close) {
      context.closePath();
    }
  }

  /**
   * destroy graphics object
   *
   */
  destroy() {
    this.renderer = null;
  }
}

CanvasRenderer.registerPlugin("graphics", CanvasGraphicsRenderer);
