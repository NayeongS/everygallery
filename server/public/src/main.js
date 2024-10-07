import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshObject, Lamp, RoboticVaccum } from './MeshObject.js';
import { KeyController } from './KeyController.js';
import { Player } from './Player.js';
import * as CANNON from 'cannon-es';


const canvas = document.querySelector('#three-canvas');  
const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2: 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Camera
const camera = new THREE.PerspectiveCamera(
    60, // fov
    window.innerWidth / window.innerHeight, // aspect
    0.1, // near
    1000 // far
);
camera.position.set(0, 3, 7);
scene.add(camera);

// const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const keyController = new KeyController();

// Light
const ambientLight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048;
pointLight.position.y = 10;
scene.add(ambientLight, pointLight);

// Cannon(Physics)
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0);

const defaultCannonMaterial = new CANNON.Material('default');
const playerCannonMaterial = new CANNON.Material('player');
const defaultContactMaterial = new CANNON.ContactMaterial(
    defaultCannonMaterial,
    defaultCannonMaterial,
    {
        friction: 1,
        restitution: 0.2
    }
);
const playerContactMaterial = new CANNON.ContactMaterial(
    playerCannonMaterial,
    defaultCannonMaterial,
    {
        friction: 100,
        restitution: 0
    }
);
cannonWorld.addContactMaterial(playerContactMaterial);
cannonWorld.defaultContactMaterial = defaultContactMaterial;

const cannonObjects = [];

const ground = new MeshObject({ /* ... */ });
const floor = new MeshObject({ /* ... */ });
const wall1 = new MeshObject({ /* ... */ });
const wall2 = new MeshObject({ /* ... */ });
const wall3 = new MeshObject({ /* ... */ });
scene.add(wall3);


cannonObjects.push(ground, floor, wall1, wall2, desk, lamp, roboticVaccum, magazine);

function setLayout() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Move and Interaction Functions (생략된 부분은 동일)
function move() { /* ... */ }
function moveCamera() { /* ... */ }

function updateMovementValue(event) {
    movementX = event.movementX * delta;
    movementY = event.movementY * delta;
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
function setMode(mode) {
    document.body.dataset.mode = mode;

    if (mode === 'game') {
        document.addEventListener('mousemove', updateMovementValue);
    } else if (mode === 'website') {
        document.removeEventListener('mousemove', updateMovementValue);
    }
}

const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
function checkIntersects() {
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);
    for (const item of intersects) {
        console.log(item.object.name);
        if (item.object.name === 'lamp') {
            lamp.togglePower();
            break;
        } else if (item.object.name === 'roboticVaccum') {
            roboticVaccum.togglePower();
            break;
        }
    }
}

const clock = new THREE.Clock();
let delta;
function draw() {
    delta = clock.getDelta();

    let cannonStepTime = 1/60;
    if (delta < 0.01) cannonStepTime = 1/120;
    cannonWorld.step(cannonStepTime, delta, 3);

    for (const object of cannonObjects) {
        if (object.cannonBody) {
            object.mesh.position.copy(object.cannonBody.position);
            object.mesh.quaternion.copy(object.cannonBody.quaternion);
        }
    }

    if (player.cannonBody) {
        player.mesh.position.copy(player.cannonBody.position);
        player.x = player.cannonBody.position.x;
        player.y = player.cannonBody.position.y;
        player.z = player.cannonBody.position.z;
        move();
    }

    moveCamera();
    roboticVaccum.move();

    renderer.render(scene, camera);
    renderer.setAnimationLoop(draw);
}

window.addEventListener('resize', setLayout);

document.addEventListener('click', () => {
    canvas.requestPointerLock();
});

canvas.addEventListener('click', event => {
    mouse.x = (event.clientX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / canvas.clientHeight) * 2 + 1;
    if (document.body.dataset.mode === 'game') {
        checkIntersects();
    }
});

document.addEventListener('pointerlockchange', () => {
    if (document.pointerLockElement === canvas) {
        setMode('game');
    } else {
        setMode('website');
    }
});

draw();
