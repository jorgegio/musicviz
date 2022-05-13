import './index.css';

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { analyzer, isVisualizerOn } from './listeners';
import { avg } from './utils';

// Scene Setup

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x6904ce);
const color = 0x6904ce;
const near = 1;
const far = 500;
scene.fog = new THREE.Fog(color, near, far);

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

const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
const planeMaterial = new THREE.MeshLambertMaterial({
  color: 0x6904ce,
  side: THREE.DoubleSide,
  wireframe: true
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.set(0, 30, 0);
group.add(plane);

const plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
plane2.rotation.x = -0.5 * Math.PI;
plane2.position.set(0, -30, 0);
group.add(plane2);

const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
const icosahedronMaterial = new THREE.MeshLambertMaterial({
  color: 0xff00ee,
});

const ball = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
ball.position.set(0, 0, 0);
group.add(ball);

// Lights

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff);
spotlight.intensity = 0.9;
spotlight.position.set(-10, 40, 20);
spotlight.lookAt(ball);
spotlight.castShadow = true;
scene.add(spotlight);

scene.add(group);

// Controls

const controls = new OrbitControls(camera, renderer.domElement);
controls.enablePan = false;
controls.enableZoom = false;
controls.minPolarAngle = controls.maxPolarAngle = Math.PI / 2; // Allow only horizontal rotation

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
  const ballScale = avg(buffer) / 20;
  ball.scale.set(ballScale, ballScale, ballScale);

  controls.update();

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