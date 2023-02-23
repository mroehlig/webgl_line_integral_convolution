// Class for a 2D vector field on a regular grid.
export default class Field {
  // Constructor takes an array of vectors and the width and height of the grid.
  constructor(data, width, height) {
    // Store the width and height of the grid.
    this.width = width;
    this.height = height;

    // Store the vectors.
    this.data = data;
  }

  // Get the number of vectors in the field.
  get length() {
    return this.data.length;
  }

  // Get the vector at the given index.
  get(index) {
    return this.data[index];
  }

  // Get the vector at the given x and y coordinates.
  getAt(x, y) {
    return this.get(y * this.width + x);
  }

  // Get the interpolated vector at the given x and y coordinates.
  getInterpolated(x, y) {
    // Get the four surrounding coordinates.
    let x0 = Math.floor(x);
    let x1 = Math.ceil(Math.min(x, this.width - 1));
    let y0 = Math.floor(y);
    let y1 = Math.ceil(Math.min(y, this.height - 1));

    // // If the coordinates are the same, return the vector at that coordinate.
    // if (x0 === x1 && y0 === y1) {
    //   return this.getAt(x0, y0);
    // }

    // Get the four surrounding vectors.
    let v00 = this.getAt(x0, y0);
    let v01 = this.getAt(x0, y1);
    let v10 = this.getAt(x1, y0);
    let v11 = this.getAt(x1, y1);

    // Get the four surrounding weights (bilinear interpolation).
    let w00 = (x1 - x) * (y1 - y);
    let w01 = (x1 - x) * (y - y0);
    let w10 = (x - x0) * (y1 - y);
    let w11 = (x - x0) * (y - y0);

    // // Get the four surrounding weights (bicubic interpolation).
    // let w00 = (x1 - x) * (y1 - y) * (x1 - x) * (y1 - y);
    // let w01 = (x1 - x) * (y - y0) * (x1 - x) * (y - y0);
    // let w10 = (x - x0) * (y1 - y) * (x - x0) * (y1 - y);
    // let w11 = (x - x0) * (y - y0) * (x - x0) * (y - y0);

    // // Get the four surrounding weights (biquadratic interpolation).
    // let w00 = (x1 - x) * (y1 - y) * (x1 - x) * (y1 - y);
    // let w01 = (x1 - x) * (y - y0) * (x1 - x) * (y - y0);
    // let w10 = (x - x0) * (y1 - y) * (x - x0) * (y1 - y);
    // let w11 = (x - x0) * (y - y0) * (x - x0) * (y - y0);

    // Check if the weights sum to zero.
    if (w00 + w01 + w10 + w11 === 0) {
      // Get the four surrounding weights (nearest neighbor interpolation).
      w00 = x1 - x < x - x0 ? y1 - y < y - y0 ? 1 : 0 : y1 - y < y - y0 ? 0 : 1;
      w01 = x1 - x < x - x0 ? y1 - y < y - y0 ? 0 : 1 : y1 - y < y - y0 ? 1 : 0;
      w10 = x1 - x < x - x0 ? y1 - y < y - y0 ? 0 : 1 : y1 - y < y - y0 ? 1 : 0;
      w11 = x1 - x < x - x0 ? y1 - y < y - y0 ? 1 : 0 : y1 - y < y - y0 ? 0 : 1;
    }

    // Get the interpolated vector.
    let v0 = v00[0] * w00 + v01[0] * w01 + v10[0] * w10 + v11[0] * w11;
    let v1 = v00[1] * w00 + v01[1] * w01 + v10[1] * w10 + v11[1] * w11;

    return [v0, v1];
  }

  // Get resized field.
  resize(width, height) {
    // Create the resized field.
    let field = new Field([], width, height);

    // Get the scale factors.
    let scaleX = this.width / width;
    let scaleY = this.height / height;

    // Resize the field.
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Get the vector at the current position.
        let v = this.getInterpolated(x * scaleX, y * scaleY);

        // Set the vector at the current position.
        field.data[y * width + x] = v;
      }
    }

    return field;
  }
}