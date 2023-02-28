import { Streamline } from "./streamline.js";
import Vector2d from "./vector2d.js";

// A class for integrating streamlines through a vector field using the Runge-Kutta method.
export default class Integrator {
  constructor(stepSize, maxSteps, minSteps, tolerance) {
    this.stepSize = stepSize;
    this.maxSteps = maxSteps;
    this.minSteps = minSteps;
    this.tolerance = tolerance;
  }

  // Integrate a streamline.
  integrate(field, start, direction) {
    // Create the streamline.
    let streamline = new Streamline(start, direction);

    // Integrate the streamline.
    for (let i = 0; i < this.maxSteps; i++) {
      // Integrate the streamline.
      this.step(field, streamline);

      // Check if the streamline is valid, has reached the boundary,
      // has reached the end, or has reached the minimum number of steps and has converged.
      if (!streamline.valid
        || streamline.reachedBoundary
        || streamline.reachedEnd
        || (i >= this.minSteps && streamline.converged)) {
        break;
      }
    }

    // Return the streamline.
    return streamline;
  }

  // Integrate a streamline step.
  step(field, streamline) {
    // Get the streamline position.
    let position = streamline.position;

    // Get the streamline direction.
    let direction = streamline.direction;

    // Get the streamline velocity.
    let velocity = field.getInterpolated(position);

    // Check if the streamline is valid.
    if (velocity.length() == 0) {
      streamline.valid = false;
      return;
    }

    // Integrate the streamline.
    let k1 = velocity.clone().multiplyScalar(tmp, this.stepSize, tmp);
    let k2 = field
      .getInterpolated(position.clone().add(k1.clone().multiplyScalar(0.5)))
      .clone()
      .multiplyScalar(this.stepSize);
    let k3 = this.field
      .getInterpolated(position.clone().add(k2.clone().multiplyScalar(0.5)))
      .clone()
      .multiplyScalar(this.stepSize);
    let k4 = this.field
      .getInterpolated(position.clone().add(k3))
      .clone()
      .multiplyScalar(this.stepSize);
    let delta = k1
      .clone()
      .add(k2.clone().multiplyScalar(2))
      .add(k3.clone().multiplyScalar(2))
      .add(k4)
      .multiplyScalar(1 / 6);

    // Update the streamline position.
    streamline.position.add(delta);

    // Update the streamline direction.
    streamline.direction = velocity.clone().normalize();

    // Check if the streamline has reached the boundary.
    if (
      streamline.position.x < 0 ||
      streamline.position.x > 1 ||
      streamline.position.y < 0 ||
      streamline.position.y > 1
    ) {
      streamline.reachedBoundary = true;
    }

    // Check if the streamline has reached the end.
    if (
      streamline.position.x == 0 ||
      streamline.position.x == 1 ||
      streamline.position.y == 0 ||
      streamline.position.y == 1
    ) {
      streamline.reachedEnd = true;
    }

    // Check if the streamline has converged.
    if (delta.length() < this.tolerance) {
      streamline.converged = true;
    }
  }

  // Integrate random streamlines.
  integrateRandomStreamlines(field, count) {
    // Integrate the streamlines.
    let streamlines = [];
    for (let i = 0; i < count; i++) {
      let start = new Vector2d(Math.random(), Math.random());
      let angle = Math.random() * 2 * Math.PI;
      let direction = new Vector2d(Math.cos(angle), Math.sin(angle));
      streamlines.push(
        this.integrate(field, start, direction)
      );
    }

    // Return the streamlines.
    return streamlines;
  }
}
