// Vector math 2D library for manipulating arrays of two numbers.
export function create(x, y) {
  return [x, y];
}

export function clone(v) {
  return [v[0], v[1]];
}

export function copy(v, out) {
  out[0] = v[0];
  out[1] = v[1];
  return out;
}

export function set(x, y, out) {
  out[0] = x;
  out[1] = y;
  return out;
}

export function add(v, w, out) {
  out[0] = v[0] + w[0];
  out[1] = v[1] + w[1];
  return out;
}

export function subtract(v, w, out) {
  out[0] = v[0] - w[0];
  out[1] = v[1] - w[1];
  return out;
}

export function multiply(v, w, out) {
  out[0] = v[0] * w[0];
  out[1] = v[1] * w[1];
  return out;
}

export function divide(v, w, out) {
  out[0] = v[0] / w[0];
  out[1] = v[1] / w[1];
  return out;
}

export function scale(v, s, out) {
  out[0] = v[0] * s;
  out[1] = v[1] * s;
  return out;
}

export function negate(v, out) {
  out[0] = -v[0];
  out[1] = -v[1];
  return out;
}

export function dot(v, w) {
  return v[0] * w[0] + v[1] * w[1];
}

export function cross(v, w) {
  return v[0] * w[1] - v[1] * w[0];
}

export function length(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1]);
}

export function squaredLength(v) {
  return v[0] * v[0] + v[1] * v[1];
}

export function normalize(v, out) {
  let len = length(v);
  out[0] = v[0] / len;
  out[1] = v[1] / len;
  return out;
}
