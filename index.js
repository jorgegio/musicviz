import './index.css';

import * as THREE from 'three';
import { analyzer, isVisualizerOn } from './listeners';

// Scene Setup

const scene = new THREE.Scene();

const group = new THREE.Group();

const renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true,
  canvas: document.querySelector('#visualizer')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 100);
camera.lookAt(scene.position);

scene.add(camera);

// Geometry



// Render

function render() {
  if (!isVisualizerOn) {
    renderer.render(scene, camera);
    return;
  }

  const bufferSize = analyzer.frequencyBinCount;
  const buffer = new Uint8Array(bufferSize);
  analyzer.getByteFrequencyData(buffer);

  // Modify geometry based on buffer

  renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  render();
}

animate();