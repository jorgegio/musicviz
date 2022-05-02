import './index.css';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#visualizer')
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.setZ(5);

const monkeyScale = 1.5;
const monkeyMaterial = new THREE.MeshToonMaterial({ color: 0x30f0c0 });


const loader = new GLTFLoader();
loader.load(
  'models/monkey.glb',
  function (gltf) {
    gltf.scene.children[ 0 ].scale.set(monkeyScale, monkeyScale, monkeyScale);
    gltf.scene.children[ 0 ].material = monkeyMaterial;
    const root = gltf.scene;
    scene.add(root);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
  },
  (error) => {
    console.log(error);
  }
);

scene.background = new THREE.Color(0xffffff);
const light = new THREE.HemisphereLight(0xffffff, 0x000000, 2);
scene.add(light);

function animate() {
  requestAnimationFrame(animate);

  render();
}

function render() {
  renderer.render(scene, camera);
}

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

animate();