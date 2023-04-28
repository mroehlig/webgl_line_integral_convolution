// Clone the vector.
export function clone(v) {
  return v.slice();
}

// Set the vector.
export function set(x, y, v) {
  v[0] = x;
  v[1] = y;
  return v;
}

// Get the length of the vector.
export function length(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

// Get the squared length of the vector.
export function lengthSqr(v) {
  return v[0] * v[0] + v[1] * v[1];
}

// Normalize the vector.
export function normalize(v) {
  let length = length(v);
  v[0] /= length;
  v[1] /= length;
  return v;
}

// Negate the vector.
export function negate(v) {
  v[0] = -v[0];
  v[1] = -v[1];
  return v;
}

// Add second vector to first vector.
export function add(v, other) {
  v[0] += other[0];
  v[1] += other[1];
  return v;
}

// Subtract second vector from first vector.
export function subtract(v, other) {
  v[0] -= other[0];
  v[1] -= other[1];
  return v;
}

// Scale the vector.
export function scale(scalar) {
  v[0] *= scalar;
  v[1] *= scalar;
  return v;
}

// Get the dot product of two vectors.
export function dot(a, b) {
  return a[0] * b[0] + a[1] * b[1];
}

// Get the cross product of two vectors.
export function cross(a, b) {
  return a[0] * b[1] - a[1] * b[0];
}

// Get the angle between two vectors.
export function angle(a, b) {
  return Math.acos(dot(a, b) / (length(a) * length(b)));
}

// Get the distance between two vectors.
export function distance(a, b) {
  return length(subtract(clone(a), b));
}

// Get the distance between two vectors.
export function distanceSqr(vector) {
  return lengthSqr(subtract(clone(a), b));
}
