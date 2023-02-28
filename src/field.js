import Vector2d from "./vector2d";

// Object holding different generator functions for 2D vector fields.
const FieldTypes = {
  // Random field.
  random: (x, y) => {
    return new Vector2d(Math.random() - 0.5, Math.random() - 0.5);
  },

  // Repelling field.
  repel: (x, y) => {
    return new Vector2d(x - 0.5, y - 0.5);
  },

  // Attractive field.
  attract: (x, y) => {
    return new Vector2d(0.5 - x, 0.5 - y);
  },

  // Saddle field.
  saddle: (x, y) => {
    return new Vector2d(x - 0.5, -y + 0.5);
  },

  // Circle field.
  circle: (x, y) => {
    return new Vector2d(y - 0.5, 0.5 - x);
  },

  // Swirl field.
  swirl: (x, y) => {
    x = (x - 0.5) * 4 * Math.PI;
    y = (y - 0.5) * 4 * Math.PI;

    return new Vector2d(Math.sin(x + y), Math.cos(x - y));
  },

  // Hilly bowl field.
  hilly_bowl: (x, y) => {
    x = (x - 0.5) * 4 * Math.PI;
    y = (y - 0.5) * 4 * Math.PI;

    return new Vector2d(0.5, Math.sin(x * x + y * y));
  },

  // Vortex field.
  vortex: (x, y) => {
    x = (x - 0.5) * 10;
    y = (y - 0.5) * 10;

    const RADIUS = 3.0,
      PULL = 0.25;

    let sqSum = Math.max(x * x + y * y, 0.00001);
    let divisor = !sqSum ? 1 : 1 / Math.sqrt(sqSum);
    let factor = Math.exp(-sqSum / RADIUS);
    let u = y * factor * divisor - PULL * x;
    let v = -x * factor * divisor - PULL * y;

    return new Vector2d(u, v);
  },
};

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

  // Generate a field.
  static generate(type, width, height) {
    // Create the field.
    let field = new Field([], width, height);

    // Generate the field.
    for (let j = 0; j < height; j++) {
      for (let i = 0; i < width; i++) {
        let x = i / width;
        let y = j / height;

        // Get the vector at the current position.
        let v = FieldTypes[type](x, y);

        // Set the vector at the current position.
        field.data[j * width + i] = v;
      }
    }

    return field;
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

    // Get the interpolated vector.
    let v0 = v00.x * w00 + v01.x * w01 + v10.x * w10 + v11.x * w11;
    let v1 = v00.y * w00 + v01.y * w01 + v10.y * w10 + v11.y * w11;

    return new Vector2d(v0, v1);
  }

  // Get data as flat array.
  getFlat() {
    let flat = [];

    for (let i = 0; i < this.length; i++) {
      let v = this.get(i);
      flat.push(v.x, v.y);
    }

    return flat;
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
