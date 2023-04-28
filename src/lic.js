import { add, scale, clone } from "./vector2d.js";

export default class LIC {
  constructor(width, height) {
    // Store the width and height.
    this.width = width;

    // Create the noise texture.
    this.noiseTexture = new Float32Array(width * height);
    this.noiseTexture.forEach((_, i, arr) => {
      arr[i] = Math.random();
    });

    // Create the intensity texture.
    this.intensityTexture = new Float32Array(width * height);

    // Create the count texture.
    this.countTexture = new Uint32Array(width * height);
  }

  // Compute the line integral convolution.
  compute(field) {
    // Get half width and height.
    let halfWidth = this.width / 2;
    let halfHeight = this.height / 2;
    let count = halfWidth * halfHeight;

    // Compute the streamlines.
    let points = [];
    for (let i = 0; i < count; ++i) {
      // Get the corners of the pixel.
      points[0] = i % halfWidth;
      points[1] = Math.floor(i / halfWidth);
      points[2] = points[0] + halfWidth;
      points[3] = points[1];
      points[4] = points[0];
      points[5] = points[1] + halfHeight;
      points[6] = points[2];
      points[7] = points[5];

      for (let j = 0; j < points.length; j += 2) {
        let x = points[j];
        let y = points[j + 1];
        if (countTexture[x + y * this.width] < countMinimum) {
          this.updateIntensity(this.computeStreamline(field, x, y));
        }
      }
    }

    // Normalize the intensity texture.
    this.intensityTexture.forEach((v, i, arr) => {
      arr[i] = v / Math.max(this.countTexture[i], 1);
    });
  }

  // Compute the streamline.
  computeStreamline(field, x, y) {
    let forward = [];
    let backward = [];
    let forwardPoint = [x, y];
    let backwardPoint = [x, y];

    for (let i = 0; i < L + M - 1; ++i) {
      forwardPoint = this.rungeKutta(field, forwardPoint, h);
      forward[i] = forwardPoint;

      backwardPoint = this.rungeKutta(field, backwardPoint, -h);
      backward[i] = backwardPoint;
    }

    backward.reverse();
    backward.push(...forward);
    backward.forEach((v, i) => (backward[i] = Math.floor(v)));

    return backward;
  }

  // Runge-Kutta integration.
  rungeKutta(field, p, h) {
    let v = field.sample(p[0], p[1]);
    let k1 = scale(v, h);

    let t = add(clone(p), scale(clone(k1), 0.5));
    v = field.sample(t[0], t[0]);
    k2 = scale(v, h);

    t = add(clone(p), scale(clone(k2), 0.5));
    v = field.sample(t[0], t[0]);
    k3 = scale(v, h);

    t = add(clone(p), k3);
    v = field.sample(t[0], t[0]);
    k4 = scale(v, h);

    t = add(scale(k1, 1 / 6), scale(k2, 1 / 3));
    t = add(t, scale(k3, 1 / 3));
    t = add(t, scale(k4, 1 / 6));
    p = add(clone(p), t);

    return p;
  }

  // Update the intensity texture.
  updateIntensity(streamLine) {
    let l = streamLine.length;
    let n = L;
    let mid = ((l / 2) >> 0) + offset;
    let x0 = streamLine[mid];
    let intensityX0 = 0;
    let k = 0;

    // Compute integral for center of streamline.
    for (let i = -n; i < n; ++i) {
      let xi = streamLine[mid + i];
      if (this.contains(xi)) {
        intensityX0 += this.getNoise(xi);
        k++;
      }
    }
    intensityX0 /= k;
    this.updateTextures(x0[0] + x0[1] * this.width, intensityX0);

    // Compute integral for left and right points along the streamline.
    let intensityForward = intensityX0;
    let intensityBackward = intensityX0;
    for (let i = 1; i < M; ++i) {
      // Compute forward integral.
      let iFwd = i + mid;
      let iFwdRight = iFwd + n + 1;
      let iFwdLeft = iFwd - n;
      intensityForward = this.updateForwardBackward(
        iFwd,
        iFwdLeft,
        iFwdRight,
        streamLine,
        k,
        intensityForward
      );

      // Compute backward integral.
      let iBwd = -i + mid;
      let iBwdRight = iBwd - n - 1;
      let iBwdLeft = iBwd + n;
      intensityBackward = this.updateForwardBackward(
        iBwd,
        iBwdLeft,
        iBwdRight,
        streamLine,
        k,
        intensityBackward
      );
    }
  }

  updateForwardBackward(index, left, right, streamline, k, intensity) {
    let x = streamline[index];

    if (right >= 0 && left < l) {
      let xLeft = streamline[left];
      let xRight = streamline[right];

      if (this.contains(xLeft) && this.contains(xRight)) {
        intensity += (this.getNoise(xRight) - this.getNoise(xLeft)) / k;
        this.updateTextures(x[0] + x[1] * this.width, intensity);
      }
    }

    return intensity;
  }

  updateTextures(index, intensity) {
    this.intensityTexture[index] += intensity;
    this.countTexture[index]++;
  }

  contains(p) {
    return p[0] >= 0 && p[0] < this.width && p[1] >= 0 && p[1] < this.height;
  }

  getNoise(p) {
    return this.noiseTexture[p[0] + p[1] * this.width];
  }
}
