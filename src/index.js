"use strict";

import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";

import { Parameters } from "./parameter";
import { loadData } from "./data";
import Field from "./field";
import Particles from "./particle";

import VertexShaderSource from "./shaders/field.vs";
import FragmentShaderSource from "./shaders/field.fs";

import "./style.css";

let canvas;
let overlay;
let renderer;
let camera;
let scene;
let quad;
let field;
let particles;
let stats;

// Render the scene.
function render(time, lastTime) {
  stats.begin();

  // Update.
  let dt = time - lastTime;
  particles.update(field, dt / 1000, Parameters.particleSpeed);

  // Render.
  renderer.render(scene, camera);
  renderParticles();

  stats.end();

  // Repaint.
  repaint(time);
}

function renderParticles() {
  overlay.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);

  if (!Parameters.particleVisible) {
    return;
  }

  // Render overlay.
  overlay.fillStyle = "white";
  overlay.font = "20px monospace";
  overlay.fillText("Particles: " + particles.length, 10, 30);

  // Render particles.
  let particleColor = new THREE.Color(Parameters.particleColor);
  let particleCssColor = `rgba(${particleColor.r * 255}, ${
    particleColor.g * 255
  }, ${particleColor.b * 255}, ${Parameters.particleOpacity})`;

  for (let i = 0; i < particles.length; i++) {
    let particle = particles.get(i);
    overlay.beginPath();

    // Fill.
    overlay.fillStyle = particleCssColor;
    overlay.arc(
      particle.x * overlay.canvas.width,
      (1 - particle.y) * overlay.canvas.height,
      Parameters.particleSize,
      0,
      2 * Math.PI
    );
    overlay.fill();

    // Outline.
    overlay.strokeStyle = `rgba(0, 0, 0, ${Parameters.particleOpacity})`;
    overlay.lineWidth = 1;
    overlay.stroke();

    // History.
    let history = particles.getHistory(i);
    overlay.beginPath();

    // Move to the first point according to the history index.
    let index = particles.historyIndex;
    overlay.moveTo(
      history[index].x * overlay.canvas.width,
      (1 - history[index].y) * overlay.canvas.height
    );
    for (let j = 1; j < history.length; j++) {
      let k = (index + j) % history.length;
      overlay.lineTo(
        history[k].x * overlay.canvas.width,
        (1 - history[k].y) * overlay.canvas.height
      );
    }
    overlay.strokeStyle = particleCssColor;
    overlay.lineWidth = Parameters.particleTrailWidth;
    overlay.stroke();
  }
}

function repaint(lastTime = performance.now()) {
  window.requestAnimationFrame((time) => {
    render(time, lastTime);
  });
}

// Resize the canvas.
function resize() {
  const { width, height } = overlay.canvas.getBoundingClientRect();
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const dpr = window.devicePixelRatio;
  const displayWidth = Math.round(width * dpr);
  const displayHeight = Math.round(height * dpr);
  overlay.canvas.width = displayWidth;
  overlay.canvas.height = displayHeight;
}

// Update the field.
function updateData(data, width, height) {
  // Create and update the field.
  field = new Field(data, width, height);
  updateTexture(field.getFlat(), width, height, Parameters.fieldSampling);
}

// Generate a field.
function generateData(type) {
  // Create and update the field.
  field = Field.generate(type, Parameters.fieldSize, Parameters.fieldSize);
  updateTexture(
    field.getFlat(),
    field.width,
    field.height,
    Parameters.fieldSampling
  );
}

// Update the texture.
function updateTexture(data, width, height, sampling = "nearest") {
  // Create the texture.
  let texture = new THREE.DataTexture(
    new Float32Array(data.flat()),
    width,
    height,
    THREE.RGFormat,
    THREE.FloatType
  );

  // Update the quad.
  quad.material.uniforms.field.value = texture;
  updateTextureSampling(sampling);
}

// Update texture sampling.
function updateTextureSampling(sampling) {
  let texture = quad.material.uniforms.field.value;

  switch (sampling.toUpperCase()) {
    case "NEAREST":
      texture.minFilter = THREE.NearestFilter;
      texture.magFilter = THREE.NearestFilter;
      break;
    case "LINEAR":
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      break;
    default:
      break;
  }

  texture.needsUpdate = true;
}

// Update uniforms.
function updateUniforms() {
  // Update field parameters.
  quad.material.uniforms.field_coloring.value =
    Parameters.getFieldColoringIndex();

  // Update glyph parameters.
  quad.material.uniforms.glyph_visible.value = Parameters.glyphVisible ? 1 : 0;
  quad.material.uniforms.glyph_grid_size.value = Parameters.glyphGridSize;
  quad.material.uniforms.glyph_size.value = Parameters.glyphSize;
  quad.material.uniforms.glyph_alpha.value = Parameters.glyphOpacity;
  quad.material.uniforms.glyph_color.value = new THREE.Color(
    Parameters.glyphColor
  );
}

// Resize the field.
function resizeField(scale) {
  let width = Math.round(field.width * scale);
  let height = Math.round(field.height * scale);

  // Create and update the field.
  field = field.resize(width, height);
  updateTexture(field.getFlat(), width, height, Parameters.fieldSampling);
}

// Initialize.
function init() {
  // Check if WebGL2 is available.
  if (!WebGL.isWebGL2Available()) {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
  }

  // Get the canvas.
  canvas = document.getElementById("canvas");

  // Get the overlay.
  const overlayCanvas = document.getElementById("overlay");
  overlay = overlayCanvas.getContext("2d");

  // Create the renderer.
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Create the camera.
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.innerWidth / canvas.innerHeight,
    1,
    1000
  );

  // Create the scene.
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0ff);

  // Create the full screen quad.
  quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: VertexShaderSource,
      fragmentShader: FragmentShaderSource,
      uniforms: {
        field: { value: null },
        field_coloring: { value: Parameters.getFieldColoringIndex() },
        glyph_visible: { value: Parameters.glyphVisible ? 1 : 0 },
        glyph_grid_size: { value: Parameters.glyphGridSize },
        glyph_size: { value: Parameters.glyphSize },
        glyph_alpha: { value: Parameters.glyphOpacity },
        glyph_color: { value: new THREE.Color(Parameters.glyphColor) },
      },
      depthWrite: false,
      depthTest: false,
    })
  );
  scene.add(quad);

  // Create the GUI.
  const gui = new GUI();
  let dataFolder = gui.addFolder("Data");
  dataFolder
    .add(Parameters, "datasets", [...Parameters.datasets])
    .setValue(Parameters.dataset)
    .name("Generate")
    .onChange((name) => {
      Parameters.dataset = name;
      generateData(name);
    });
  dataFolder
    .add(Parameters, "fieldSize", 1, 500)
    .step(1)
    .setValue(Parameters.fieldSize)
    .name("Size")
    .onChange((size) => {
      Parameters.fieldSize = size;
      generateData(Parameters.dataset);
    });

  // Field controls.
  let fieldFolder = gui.addFolder("Field");
  fieldFolder
    .add(Parameters, "fieldColoring", ["Direction", "Magnitude", "None"])
    .setValue(Parameters.fieldColoring)
    .name("Coloring")
    .onChange((coloring) => {
      Parameters.fieldColoring = coloring;
      updateUniforms();
    });
  fieldFolder
    .add(Parameters, "fieldSampling", ["Nearest", "Linear"])
    .setValue(Parameters.fieldSampling)
    .name("Sampling")
    .onChange((sampling) => {
      Parameters.fieldSampling = sampling;
      updateTextureSampling(sampling);
    });

  // Glyph controls.
  let glyphFolder = gui.addFolder("Glyphs");
  glyphFolder
    .add(Parameters, "glyphVisible")
    .setValue(Parameters.glyphVisible)
    .name("Show")
    .onChange((visible) => {
      Parameters.glyphVisible = visible;
      updateUniforms();
    });
  glyphFolder
    .add(Parameters, "glyphGridSize", 1, 100)
    .step(1)
    .setValue(Parameters.glyphGridSize)
    .name("Grid size")
    .onChange((size) => {
      Parameters.glyphGridSize = size;
      updateUniforms();
    });
  glyphFolder
    .add(Parameters, "glyphSize", 0.0, 1.0)
    .step(0.01)
    .setValue(Parameters.glyphSize)
    .name("Size")
    .onChange((size) => {
      Parameters.glyphSize = size;
      updateUniforms();
    });
  glyphFolder
    .addColor(Parameters, "glyphColor")
    .name("Color")
    .onChange((color) => {
      Parameters.glyphColor = color;
      updateUniforms();
    });
  glyphFolder
    .add(Parameters, "glyphOpacity", 0.0, 1.0)
    .step(0.01)
    .name("Opacity")
    .onChange((alpha) => {
      Parameters.glyphOpacity = alpha;
      updateUniforms();
    });

  // Particle controls.
  let particleFolder = gui.addFolder("Particles");
  particleFolder
    .add(Parameters, "particleVisible")
    .setValue(Parameters.particleVisible)
    .name("Show");
  particleFolder
    .add(Parameters, "particleCount", 0, 1000)
    .step(1)
    .setValue(Parameters.particleCount)
    .name("Count")
    .onChange((count) => (particles = new Particles(count)));
  particleFolder.add({ Reset: () => { particles.resetAll() } }, "Reset"); 
  particleFolder
    .add(Parameters, "particleSpeed", 0.0, 4.0)
    .step(0.01)
    .setValue(Parameters.particleSpeed)
    .name("Speed");
  particleFolder
    .add(Parameters, "particleSize", 0, 10)
    .step(0.01)
    .setValue(Parameters.particleSize)
    .name("Size");
  particleFolder.addColor(Parameters, "particleColor").name("Color");
  particleFolder
    .add(Parameters, "particleOpacity", 0.0, 1.0)
    .step(0.01)
    .name("Opacity");
  particleFolder
    .add(Parameters, "particleTrailWidth", 0, 10)
    .step(0.1)
    .name("Trail width");

  // Stats.
  stats = new Stats();
  document.body.appendChild(stats.dom);

  // Generate the data.
  generateData(Parameters.dataset);

  // Create the particles.
  particles = new Particles(100);

  // Start the animation.
  resize();
  repaint();
}

// Add event listeners for load and resize.
window.addEventListener("load", init);
window.addEventListener("resize", resize, false);
