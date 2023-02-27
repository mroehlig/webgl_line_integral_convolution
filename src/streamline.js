// A class representing a streamline.
export default class Streamline {
  // Create a streamline.
  constructor(start, direction) {
    // Set the streamline start.
    this.start = start;

    // Set the streamline direction.
    this.direction = direction;

    // Set the streamline position.
    this.position = start;

    // Set the streamline valid flag.
    this.valid = true;

    // Set the streamline reached boundary flag.
    this.reachedBoundary = false;

    // Set the streamline reached end flag.
    this.reachedEnd = false;

    // Set the streamline converged flag.
    this.converged = false;

    // Set the streamline points.
    this.points = [];
  }

  // Add a streamline point.
  addPoint(point) {
    // Add the streamline point.
    this.points.push(point);

    // Set the streamline position.
    this.position = point.position;

    // Set the streamline reached boundary flag.
    this.reachedBoundary = point.reachedBoundary;

    // Set the streamline reached end flag.
    this.reachedEnd = point.reachedEnd;

    // Set the streamline converged flag.
    this.converged = point.converged;
  }
}
