export const Parameters = {
  // Dataset parameters.
  datasets: [
    "attract",
    "repel",
    "saddle",
    "circle",
    "vortex",
    "swirl",
    "hilly_bowl",
    "random",
  ],
  dataset: "saddle",

  // Field parameters.
  fieldSize: 100,
  fieldColorings: ["Direction", "Magnitude", "None"],
  fieldColoring: "Direction",
  getFieldColoringIndex: function () {
    return this.fieldColorings.indexOf(this.fieldColoring);
  },
  fieldSampling: "Linear", // "Nearest", "Linear"

  // Glyph parameters.
  glyphVisible: true,
  glyphGridSize: 20,
  glyphSize: 0.4,
  glyphColor: 0x000000,
  glyphOpacity: 0.5,

  // Particle parameters.
  particleVisible: true,
  particleCount: 100,
  particleSpeed: 0.1,
  particleSize: 5.0,
  particleColor: 0xffffff,
  particleOpacity: 0.5,
  particleTrailWidth: 1.0,

  // Streamline parameters.
  streamlineCount: 100,
  integratorStepSize: 0.01,
  integratorMinSteps: 100,
  integratorMaxSteps: 1000,
  integratorTolerance: 0.0001,
};
