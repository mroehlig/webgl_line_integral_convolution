// A particle simulation class.
export default class Particles {
  // Constructor initializes the particles with random positions.
  constructor(count, historyLength = 100) {
    // Store the particles.
    this.particles = [];
    this.history = [];
    this.historyLength = historyLength;
    this.historyIndex = 0;

    // Initialize the particles and history.
    for (let i = 0; i < count; i++) {
      let x = Math.random();
      let y = Math.random();
      this.particles.push([x, y]);
      this.history.push([]);

      for (let j = 0; j < historyLength; j++) {
        this.history[i].push([x, y]);
      }
    }
  }

  // Get the number of particles.
  get length() {
    return this.particles.length;
  }

  // Get the particle at the given index.
  get(index) {
    return this.particles[index];
  }

  // Get the history of the particle at the given index.
  getHistory(index) {
    return this.history[index];
  }

  // Reset the particle at the given index.
  reset(index) {
    let x = Math.random();
    let y = Math.random();
    this.particles[index] = [x, y];

    // Reset the history.
    for (let i = 0; i < this.historyLength; i++) {
      this.history[index][i] = [x, y];
    }
  }

  // Reset all particles.
  resetAll() {
    for (let i = 0; i < this.length; i++) {
      this.reset(i);
    }
  }

  // Update the particles.
  update(field, dt) {
    // Update the particles.
    for (let i = 0; i < this.length; i++) {
      let particle = this.get(i);

      // Get the vector at the particle's position.
      let vector = field.getInterpolated(
        particle[0] * field.width,
        particle[1] * field.height
      );

      // Update the particle's position.
      let x = particle[0] + vector[0] * dt;
      let y = particle[1] + vector[1] * dt;
      let dx = x - particle[0];
      let dy = y - particle[1];
      let dist = dx * dx + dy * dy;

      // If the particle is outside the field or movement to small, reset it.
      if (x < 0 || x > 1 || y < 0 || y > 1 || dist < 0.00000001) {
        this.reset(i);
      } else {
        particle[0] = x;
        particle[1] = y;

        // Update the history.
        let history = this.getHistory(i)[this.historyIndex];
        history[0] = x;
        history[1] = y;
      }
    }

    // Update the history index.
    this.historyIndex = (this.historyIndex + 1) % this.historyLength;
  }
}
