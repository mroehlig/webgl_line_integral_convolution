import Integrator from "./integrator.js";

// A class for fast line integral convolution (FastLIC).
export default class FastLIC {
  constructor(field, stepSize, maxSteps, minSteps, tolerance) {
    // Set the field.
    this.field = field;

    // Set the step size.
    this.stepSize = stepSize;

    // Set the maximum number of steps.
    this.maxSteps = maxSteps;

    // Set the minimum number of steps.
    this.minSteps = minSteps;

    // Set the tolerance.
    this.tolerance = tolerance;

    // Create the integrator.
    this.integrator = new Integrator(
      field,
      stepSize,
      maxSteps,
      minSteps,
      tolerance
    );
  }

  // Render random streamlines using Canvas2D.
  renderRandomStreamlinesCanvas2D(canvas, count, length, width, color) {
    // Get the canvas context.
    let context = canvas.getContext("2d");

    // Set the canvas width.
    canvas.width = this.field.width;

    // Set the canvas height.
    canvas.height = this.field.height;

    // Set the canvas background color.
    canvas.style.backgroundColor = "black";

    // Set the canvas image smoothing.
    context.imageSmoothingEnabled = false;

    // Set the canvas line width.
    context.lineWidth = width;

    // Set the canvas line color.
    context.strokeStyle = color;

    // Render the streamlines.
    for (let i = 0; i < count; i++) {
      // Get the streamline start.
      let start = this.getRandomStreamlineStart();

      // Get the streamline direction.
      let direction = this.getRandomStreamlineDirection();

      // Integrate the streamline.
      let streamline = this.integrator.integrate(start, direction);

      // Render the streamline.
      this.renderStreamlineCanvas2D(context, streamline, length);
    }
  }

  // renderStreamlineCanvas2D
  renderStreamlineCanvas2D(context, streamline, length) {
    // Get the streamline points.
    let points = streamline.points;

    // Get the streamline point count.
    let pointCount = points.length;

    // Check if the streamline is valid.
    if (streamline.valid) {
      // Check if the streamline has reached the boundary.
      if (streamline.reachedBoundary) {
        // Render the streamline.
        this.renderStreamlineCanvas2D(context, streamline, length);
      }

      // Check if the streamline has reached the end.
      if (streamline.reachedEnd) {
        // Render the streamline.
        this.renderStreamlineCanvas2D(context, streamline, length);
      }

      // Check if the streamline has reached the minimum number of steps.
      if (pointCount >= this.minSteps) {
        // Check if the streamline has converged.
        if (streamline.converged) {
          // Render the streamline.
          this.renderStreamlineCanvas2D(context, streamline, length);
        }
      }
    }

    // Check if the streamline has reached the maximum number of steps.
    if (pointCount >= this.maxSteps) {
      // Render the streamline.
      this.renderStreamlineCanvas2D(context, streamline, length);
    }

    // Check if the streamline has reached the maximum length.
    if (pointCount >= length) {
      // Render the streamline.
      this.renderStreamlineCanvas2D(context, streamline, length);
    }

    // Render the streamline.
    this.renderStreamlineCanvas2D(context, streamline, length);
  }

  // Render a streamline using Canvas2D.
  renderStreamlineCanvas2D(context, streamline, length) {
    // Get the streamline points.
    let points = streamline.points;

    // Get the streamline point count.
    let pointCount = points.length;

    // Check if the streamline has reached the maximum length.
    if (pointCount >= length) {
      // Get the streamline start.
      let start = streamline.start;

      // Get the streamline end.
      let end = streamline.end;

      // Render the streamline.
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    }
  }
}