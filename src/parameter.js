export const Parameters = {
  folder: "./assets/data/",
  datasets: [
    "center_150x150.csv.gz",
    "saddle_150x150.csv.gz",
    //"benzene_150x150.csv.gz"
    "focus_150x150.csv.gz",
  ],
  dataset: "saddle_150x150.csv.gz",
  generatableFields: [
    "attract",
    "repel",
    "saddle",
    "circle",
    "vortex",
    "swirl",
    "hilly_bowl",
    "random",
  ],
  generatedField: "saddle",
  defaultFieldSize: 150,
  scale: 0.25,
  fps: 60,
};
