"use strict";

import * as THREE from "three";
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js";
import WebGL from "three/examples/jsm/capabilities/WebGL.js";
import { ungzip } from "pako";
import Parser from "papaparse";

import { Parameters } from "./parameter";

import VertexShaderSource from "./shaders/lic.vs";
import FragmentShaderSource from "./shaders/lic.fs";

import "./style.css";

let canvas;
let renderer;
let camera;
let scene;

function render() {
  // Update.
  // ...

  // Render.
  renderer.render(scene, camera);
}

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  render();
}

function loadData(url, callback) {
  url = "./assets/data/" + url;

  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.arrayBuffer();
      }

      throw new Error("Could not load data from " + url);
    })
    .then((data) => {
      let inflated = ungzip(data, { 'to': 'string' });
      let parsed = Parser.parse(inflated, {
        dynamicTyping: true, // Convert strings to number or boolean.
        skipEmptyLines: true, // Empty lines are omitted.
      });

      callback(parsed.data);
    });
}

function update(data) {
  //console.log(data);
}

function init() {
  // WebGL 2 check.
  if (!WebGL.isWebGL2Available()) {
    document.body.appendChild(WebGL.getWebGL2ErrorMessage());
  }

  // Canvas.
  canvas = document.getElementById("canvas");

  // Renderer.
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
  });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputEncoding = THREE.sRGBEncoding;

  // Camera.
  camera = new THREE.PerspectiveCamera(
    45,
    canvas.innerWidth / canvas.innerHeight,
    1,
    1000
  );

  // Scene.
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0ff);

  // Quad.
  let quad = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      vertexShader: VertexShaderSource,
      fragmentShader: FragmentShaderSource,
      depthWrite: false,
      depthTest: false,
    })
  );
  scene.add(quad);

  // UI.
  const gui = new GUI();
  gui
    .add(Parameters, "dataset", [...Parameters.datasets])
    .setValue(Parameters.dataset)
    .name("Data")
    .onChange((name) => loadData(name, update));

  // Data.
  // ...
  loadData(Parameters.dataset, update);

  render();
}

window.addEventListener("load", init);
window.addEventListener("resize", resize, false);
