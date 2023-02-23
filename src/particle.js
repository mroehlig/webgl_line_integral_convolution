// A particle simulation class.
export default class Particles {
  // Constructor initializes the particles with random positions.
  constructor(count) {
    // Store the particles.
    this.particles = [];

    // Initialize the particles.
    for (let i = 0; i < count; i++) {
      this.particles.push([Math.random(), Math.random()]);
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

  // Reset the particle at the given index.
  reset(index) {
    this.particles[index] = [Math.random(), Math.random()];
  }

  // Update the particles.
  update(field, dt) {
    // Update the particles.
    for (let i = 0; i < this.length; i++) {
      let particle = this.get(i);

      // Get the vector at the particle's position.
      let vector = field.getInterpolated(particle[0] * field.width, particle[1] * field.height);

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
      }
    }
  }


}