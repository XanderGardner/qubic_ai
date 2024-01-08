import * as THREE from 'three';
// import WebGL from 'three/addons/capabilities/WebGL.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';

//////////////// gloabl variables ////////////////

// constants
const z_stretch = 2;
const color_board_edges = 0xb6a19e;

// create scene, camera, and rederer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(10, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(10, 60, 12 * z_stretch);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);



var rendererElement = renderer.domElement;

// Set the style for the renderer element to make it act as a background
rendererElement.style.position = 'fixed';
rendererElement.style.top = '0';
rendererElement.style.left = '0';
rendererElement.style.width = '100%';
rendererElement.style.height = '100%';
rendererElement.style.zIndex = '-1'; // Set a negative z-index to place it behind everything

// Append the renderer element to the body
document.body.appendChild(rendererElement);


// document.body.appendChild(renderer.domElement);

// create camera orbit
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(2,2,1.5*z_stretch)
orbit.enableZoom = false;
orbit.enablePan = false;
orbit.update();

// create axes
const axes = new THREE.AxesHelper(5)

// create spaces
function create_space(x, y, z) {

  // create the edges of the space
  const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 0)); 
  const edgesMaterial = new THREE.LineBasicMaterial({ color: color_board_edges });
  const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edgesMesh.position.set(x+0.5,y+0.5,z*z_stretch);

  return edgesMesh;
}

let tokens = [];
for (let x = 0; x <= 3; x++) {
  for (let y = 0; y <= 3; y++) {
    for (let z = 0; z <= 3; z++) {
      let edge = create_space(x,y,z);
      scene.add(edge);
    }
  }
}



// animate loop
function animate() {
  
  const angle = Date.now() * 0.0005; // rotation speed
  const radius = 15;

  camera.position.x = orbit.target.x + radius * Math.sin(angle);
  camera.position.z = orbit.target.z + radius * Math.cos(angle)/2;
  camera.position.y = orbit.target.y + radius * Math.cos(angle)/4;
  camera.lookAt(orbit.target);

  // render frame
	renderer.render(scene, camera);
}

// check for resizing window
window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// check if 3js is able to be supported on this device/browser
// if ( WebGL.isWebGLAvailable() ) {

renderer.setAnimationLoop(animate);
  
// } else {

// 	const warning = WebGL.getWebGLErrorMessage();
// 	document.getElementById('container').appendChild(warning);

// }



