import "./index.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import SimplexNoise from "simplex-noise";

import { analyzer, isVisualizerOn } from "./listeners";
import { avg, max, randomPointSphere } from "./utils";

// Noise Init

const simplex = new SimplexNoise(Math.random);

// Scene Setup

const scene = new THREE.Scene();
const color = 0x180133;
scene.background = new THREE.Color(color);

// Fog

scene.fog = new THREE.Fog(color, 5, 500);

const renderer = new THREE.WebGLRenderer({
	alpha: true,
	antialias: true,
	canvas: document.querySelector("#visualizer"),
});

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.autoClear = false;

// Camera

const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	5,
	1000
);
camera.position.set(0, 0, 100);
camera.lookAt(scene.position);

scene.add(camera);

// Postprocessing

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const bloomPass = new UnrealBloomPass(
	new THREE.Vector2(window.innerWidth, window.innerHeight),
	0.5,
	0,
	0.25
);

composer.addPass(bloomPass);

// Load Textures

const loader = new THREE.TextureLoader();
const particleTexture = loader.load("assets/nova.png");
const ballTexture = loader.load("assets/Plaster001_1K_Color.jpg");

// Geometry

const group = new THREE.Group();

const planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
const planeMaterial = new THREE.MeshLambertMaterial({
	color: 0x740a67,
	side: THREE.DoubleSide,
	wireframe: true,
});

const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -0.5 * Math.PI;
plane.position.set(0, -30, 0);
group.add(plane);

const icosahedronGeometry = new THREE.IcosahedronGeometry(10, 20);
const icosahedronMaterial = new THREE.MeshLambertMaterial({
	color: 0xff2975,
	transparent: true,
	opacity: 0.8,
	blending: THREE.AdditiveBlending,
	map: ballTexture,
	wireframe: true,
	depthWrite: false
});

const ball = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
const center = new THREE.Vector3(0, 0, 0);
ball.position.set(0, 0, 0);
group.add(ball);

// Particles

const PARTICLE_COUNT = 800;

let particlesGeometry = new THREE.BufferGeometry();

let particlePositions = [];
let particleStartPositions = [];
let particleVelocities = [];

for (let i = 0; i < PARTICLE_COUNT; i++) {
	const particle = randomPointSphere(THREE.MathUtils.randInt(100, 200));

	particleVelocities.push(THREE.MathUtils.randInt(25, 300));

	particleStartPositions.push(particle);

	particlePositions.push(particle.x);
	particlePositions.push(particle.y);
	particlePositions.push(particle.z);
}

particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
particlesGeometry.setAttribute('velocity', new THREE.Float32BufferAttribute(particleVelocities, 1));

const particlesMaterial = new THREE.PointsMaterial({
	size: 2,
	color: "#ffffff",
	transparent: true,
	opacity: 0.4,
	blending: THREE.AdditiveBlending,
	map: particleTexture,
	depthWrite: false
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
group.add(particles);

// Lights

const ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

const spotlight = new THREE.SpotLight(0xffffff);
spotlight.intensity = 1.5;
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
		composer.render();
		return;
	}

	// Get analyzer buffer
	const bufferSize = analyzer.frequencyBinCount;
	const buffer = new Uint8Array(bufferSize);
	analyzer.getByteFrequencyData(buffer);

	// Modify ball geometry based on buffer

	const volumeScalingFactor = 5 * (avg(buffer) / max(buffer));
	ball.scale.set(volumeScalingFactor, volumeScalingFactor, volumeScalingFactor);

	const ballPosition = ball.geometry.getAttribute("position");
	const ball_vertex = new THREE.Vector3();

	for (let i = 0; i < ballPosition.count; i++) {
		ball_vertex.fromBufferAttribute(ballPosition, i);

		ball_vertex.normalize();

		const positionalNoise = simplex.noise3D(ball_vertex.x + Date.now() * 0.0007, ball_vertex.y + Date.now() * 0.0005, ball_vertex.z + Date.now() * 0.0002);

		const distance = ball.geometry.parameters.radius + positionalNoise * 1.5;

		ball_vertex.multiplyScalar(distance);

		ballPosition.setXYZ(i, ball_vertex.x, ball_vertex.y, ball_vertex.z);
	}

	ball.geometry.attributes.position.needsUpdate = true;
	ball.geometry.attributes.normal.needsUpdate = true;

	// Modify plane geometry based on buffer

	const planePosition = plane.geometry.getAttribute("position");
	const plane_vertex = new THREE.Vector3();

	for (let i = 0; i < planePosition.count; i++) {
		plane_vertex.fromBufferAttribute(planePosition, i);

		const positionalNoise = simplex.noise2D(i, i);
		plane_vertex.setZ(positionalNoise * 0.2 * buffer[ i % buffer.length ]);

		planePosition.setXYZ(i, plane_vertex.x, plane_vertex.y, plane_vertex.z);
	}

	plane.geometry.attributes.position.needsUpdate = true;

	// Animate particles

	const particlesPosition = particles.geometry.getAttribute("position");

	const p_vertex = new THREE.Vector3();
	for (let i = 0; i < PARTICLE_COUNT; i++) {
		p_vertex.fromBufferAttribute(particlesPosition, i);

		const positionalNoise = simplex.noise2D(i, i);

		p_vertex.x -= (p_vertex.x / particleVelocities[ i ]) * (0.1 + positionalNoise);
		p_vertex.y -= (p_vertex.y / particleVelocities[ i ]) * (0.1 + positionalNoise);
		p_vertex.z -= (p_vertex.z / particleVelocities[ i ]) * (0.1 + positionalNoise);

		const distanceToCenter = p_vertex.distanceTo(center);

		if (distanceToCenter < 40 || distanceToCenter > 300) {
			p_vertex.x = particleStartPositions[ i ].x;
			p_vertex.y = particleStartPositions[ i ].y;
			p_vertex.z = particleStartPositions[ i ].z;
			particleVelocities[ i ] = THREE.MathUtils.randInt(50, 300);
		}

		particlesPosition.setXYZ(i, p_vertex.x, p_vertex.y, p_vertex.z);
	}

	particles.geometry.attributes.position.needsUpdate = true;

	// Update the camera
	controls.update();

	// Update geometries

	// Render scene
	renderer.clear();
	composer.render();
}

window.addEventListener("resize", () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);
	composer.setSize(window.innerWidth, window.innerHeight);
}, false);

function animate() {
	requestAnimationFrame(animate);

	render();
}

animate();
