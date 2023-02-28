// A class representing a 2D vector.
export default class Vector2d {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  // Set the vector.
  set(x, y) {
    this.x = x;
    this.y = y;
  }

  // Get the length of the vector.
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  // Get the length of the vector.
  lengthSquared() {
    return this.x * this.x + this.y * this.y;
  }

  // Get the normalized vector.
  normalize() {
    let length = this.length();
    return new Vector2d(this.x / length, this.y / length);
  }

  // Get the negative vector.
  negate() {
    return new Vector2d(-this.x, -this.y);
  }

  // Get the sum of two vectors.
  add(vector) {
    return new Vector2d(this.x + vector.x, this.y + vector.y);
  }

  // Get the difference of two vectors.
  subtract(vector) {
    return new Vector2d(this.x - vector.x, this.y - vector.y);
  }

  // Get the product of a vector and a scalar.
  multiplyScalar(scalar) {
    return new Vector2d(this.x * scalar, this.y * scalar);
  }

  // Get the dot product of two vectors.
  dot(vector) {
    return this.x * vector.x + this.y * vector.y;
  }

  // Get the cross product of two vectors.
  cross(vector) {
    return this.x * vector.y - this.y * vector.x;
  }

  // Get the angle between two vectors.
  angle(vector) {
    return Math.acos(this.dot(vector) / (this.length() * vector.length()));
  }

  // Get the distance between two vectors.
  distance(vector) {
    return this.subtract(vector).length();
  }

  // Get the distance between two vectors.
  distanceSquared(vector) {
    return this.subtract(vector).lengthSquared();
  }

  // Get the vector as a string.
  toString() {
    return `(${this.x}, ${this.y})`;
  }
}	
