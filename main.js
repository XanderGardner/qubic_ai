import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';


// create scene, camera, and rederer
let field_of_view = 75
let aspect_ratio = window.innerWidth/window.innerHeight
let min_render = 0.1
let max_render = 1000

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  field_of_view, aspect_ratio, min_render, max_render
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create camera orbit
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enableZoom = false;
orbit.enablePan = false;

// create cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({color: 0x0fffff});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.set(0,0,5);
orbit.update();

// create axes
const axes = new THREE.AxesHelper(5)
scene.add(axes)


// select objects
const mousePosition = new THREE.Vector2(2, 5);
const rayCaster = new THREE.Raycaster();

window.addEventListener('pointermove', function(e) {

  // normalize position to 3js coordinates
  mousePosition.x = (e.clientX / this.window.innerWidth) * 2 - 1;
  mousePosition.y = - (e.clientY / this.window.innerHeight) * 2 + 1;
});

window.addEventListener('click', function(e) {
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(scene.children);
  for (let i = 0; i < intersects.length; i++) {
    intersects[i].object.material.color.set(0Xff0000);
  }
});


// animate loop
function animate() {
  

  // animate one change for one unit of time
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  
  
  
  // render frame
	renderer.render(scene, camera);

  
}

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// check if 3js is able to be supported on this device/browser
if ( WebGL.isWebGLAvailable() ) {
	
	renderer.setAnimationLoop(animate);
  
} else {

	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById('container').appendChild(warning);

}



