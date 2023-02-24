"use strict";

import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";

import { Parameters } from "./parameter";
import { loadData } from "./data";
import Field from "./field";
import Particles from "./particle";

import VertexShaderSource from "./shaders/lic.vs";
import FragmentShaderSource from "./shaders/lic.fs";

import "./style.css";

let canvas;
let overlay;
let renderer;
let camera;
let scene;
let quad;
let field;
let fieldResized;
let particles;

// Render the scene.
function render(time, lastTime) {
  if (field) {
    // Update.
    let dt = time - lastTime;
    particles.update(fieldResized, dt / 5000);

    // Compute frame rate.
    let fps = 1000 / (time - lastTime);
    Parameters.fps = fps.toFixed(2);

    // Render.
    renderer.render(scene, camera);

    // Render overlay.
    overlay.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);
    overlay.fillStyle = "white";
    overlay.font = "20px monospace";
    overlay.fillText("Particles: " + particles.length, 10, 30);
    overlay.fillText("FPS: " + Parameters.fps, 10, 60);

    // Render particles.
    overlay.fillStyle = "red";
    for (let i = 0; i < particles.length; i++) {
      let particle = particles.get(i);
      overlay.beginPath();

      // Fill.
      overlay.fillStyle = "red";
      overlay.arc(
        particle[0] * overlay.canvas.width,
        (1 - particle[1]) * overlay.canvas.height,
        5,
        0,
        2 * Math.PI
      );
      overlay.fill();

      // Outline.
      overlay.strokeStyle = "black";
      overlay.lineWidth = 1;
      overlay.stroke();

      // History.
      let history = particles.getHistory(i);
      overlay.beginPath();

      // Move to the first point according to the history index.
      let index = particles.historyIndex;
      overlay.moveTo(
        history[index][0] * overlay.canvas.width,
        (1 - history[index][1]) * overlay.canvas.height
      );
      for (let j = 1; j < history.length; j++) {
        let k = (index + j) % history.length;
        overlay.lineTo(
          history[k][0] * overlay.canvas.width,
          (1 - history[k][1]) * overlay.canvas.height
        );
      }
      overlay.strokeStyle = "rgba(255, 0, 0, 0.5)";
      overlay.lineWidth = 2;
      overlay.stroke();
    }
  }

  // Repaint.
  repaint(time);
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
  updateTexture(field.data, width, height);

  resizeField(Parameters.scale);
}

// Generate a field.
function generateData(type) {
  // Create and update the field.
  field = Field.generate(
    type,
    Parameters.defaultFieldSize,
    Parameters.defaultFieldSize
  );
  updateTexture(field.data, field.width, field.height);

  resizeField(Parameters.scale);
}

// Update the texture.
function updateTexture(data, width, height) {
  // Create the texture.
  let texture = new THREE.DataTexture(
    new Float32Array(data.flat()),
    width,
    height,
    THREE.RGFormat,
    THREE.FloatType
  );
  // texture.minFilter = THREE.LinearFilter;
  // texture.magFilter = THREE.LinearFilter;
  // texture.wrapS = THREE.ClampToEdgeWrapping;
  // texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  // Update the quad.
  quad.material.uniforms.field.value = texture;
  quad.material.needsUpdate = true;
}

// Resize the field.
function resizeField(scale) {
  let width = Math.round(field.width * scale);
  let height = Math.round(field.height * scale);

  // Create and update the field.
  fieldResized = field.resize(width, height);
  updateTexture(fieldResized.data, width, height);
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
    .add(Parameters, "generatableFields", [...Parameters.generatableFields])
    .setValue(Parameters.generatedField)
    .name("Generate")
    .onChange((name) => generateData(name));
  dataFolder
    .add(Parameters, "dataset", [...Parameters.datasets])
    .setValue(Parameters.dataset)
    .name("Load")
    .onChange((name) => loadData(Parameters.folder + name, updateData));

  // Add controls for scaling the field.
  gui
    .add(Parameters, "scale", 0.1, 4.0)
    .step(0.125)
    .name("Scale")
    .onChange(resizeField);

  // Load the data.
  loadData(Parameters.folder + Parameters.dataset, updateData);

  // Create the particles.
  particles = new Particles(100);

  // Start the animation.
  resize();
  repaint();
}

// Add event listeners for load and resize.
window.addEventListener("load", init);
window.addEventListener("resize", resize, false);
