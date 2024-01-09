import * as THREE from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import { QubicGame } from './qubic_game.js';




//////////////// global variables ////////////////

const z_stretch = 2;
const color_board_edges = 0xb6a19e;
const color_board_edges_css = "#b6a19e";
const color_token1 = 0x68baa7;
const color_token1_css = "#68baa7";
const color_token2 = 0xfba100;
const color_token2_css = "#fba100";
const opacity_base = 0.6
const opacity_hover = 0.3;

// create scene, camera, and rederer
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(10, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(10, 60, 12 * z_stretch);
camera.up.set(0, 0, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// create camera orbit
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.target.set(2,2,1.5*z_stretch)
orbit.enableZoom = false;
orbit.enablePan = false;
orbit.update();

// mouse positioning
const mousePosition = new THREE.Vector2(-5,-5);
const rayCaster = new THREE.Raycaster();

// create axes
// const axes = new THREE.AxesHelper(5)
// scene.add(axes)

// create spaces
function create_space(x, y, z) {

  // create the edges of the space
  const edgesGeometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 0)); 
  const edgesMaterial = new THREE.LineBasicMaterial({ color: color_board_edges });
  const edgesMesh = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  edgesMesh.position.set(x+0.5,y+0.5,z*z_stretch);

  // create the token for the space
  const tokenGeometry = new THREE.CircleGeometry(0.485, 32);
  const tokenMaterial = new THREE.MeshBasicMaterial({ 
    color: color_token1, 
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.0
  });
  const tokenMesh = new THREE.Mesh(tokenGeometry, tokenMaterial);
  tokenMesh.position.set(x+0.5,y+0.5, z*z_stretch);

  return [edgesMesh, tokenMesh];
}

let tokens = [];
for (let x = 0; x <= 3; x++) {
  for (let y = 0; y <= 3; y++) {
    for (let z = 0; z <= 3; z++) {
      let [edge, token] = create_space(x,y,z);
      tokens.push(token);
      scene.add(token);
      scene.add(edge);
    }
  }
}

// create game
const game = new QubicGame();





//////////////// general helper functions ////////////////

// get the x,y,z game position for the given token object
function get_token_position(token_object) {
  let [coordx,coordy,coordz] = token_object.position;
  return [Math.floor(coordx), Math.floor(coordy), Math.floor(coordz/z_stretch)];
}

// set the game state div to indicate the game state
let gameStateDiv = document.getElementById('gamestatediv');
function set_game_state_div() {
  let state = game.getState();
  if (state === 2) {
    gameStateDiv.style.color = color_token2_css;
    if (game_mode === "multiplayer") {
      gameStateDiv.textContent = "Player 2's Turn";
    } else {
      gameStateDiv.textContent = "AI is Thinking...";
    }
  } else if (state === 1) {
    gameStateDiv.style.color = color_token1_css;
    if (game_mode === "multiplayer") {
      gameStateDiv.textContent = "Player 1's Turn";
    } else {
      gameStateDiv.textContent = "Your Turn";
    }
  } else if (state === -2) {
    gameStateDiv.style.color = color_token2_css;
    if (game_mode === "multiplayer") {
      gameStateDiv.textContent = "Player 2 Wins!";
    } else if (game_mode === "easy") {
      gameStateDiv.textContent = "You Lost to the Easy Bot";
    } else if (game_mode === "medium") {
      gameStateDiv.textContent = "You Lost to the Medium AI";
    } else if (game_mode === "hard") {
      gameStateDiv.textContent = "You Lost to the Hard AI";
    }
  } else if (state === -1) {
    gameStateDiv.style.color = color_token1_css;
    if (game_mode === "multiplayer") {
      gameStateDiv.textContent = "Player 1 Wins!";
    } else if (game_mode === "easy") {
      gameStateDiv.textContent = "You Won on Easy!";
    } else if (game_mode === "medium") {
      gameStateDiv.textContent = "You Won on Medium!";
    } else if (game_mode === "hard") {
      gameStateDiv.textContent = "You Won on Hard!";
    }
  } else {
    gameStateDiv.style.color = color_board_edges_css;
    gameStateDiv.textContent = "It's A Tie!";
  }
}
set_game_state_div()

function set_solution() {
  const [a,b,c,d] = game.getWinningCoords();
  const x1 = a[0]+0.5;
  const y1 = a[1]+0.5;
  const z1 = a[2] * z_stretch;
  const x2 = b[0]+0.5;
  const y2 = b[1]+0.5;
  const z2 = b[2] * z_stretch;

  const startPoint = new THREE.Vector3(x1, y1, z1);
  const endPoint = new THREE.Vector3(x2, y2, z2);
  const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
  
  // cylinder geometry
  const radius = 0.1; 
  const height = 800;
  const radialSegments = 8;
  const geometry = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
  const color = game.getWinner() === 1 ? color_token1 : color_token2;
  const material = new THREE.MeshBasicMaterial({color: color, opacity: 0.4, transparent: true});
  const tube = new THREE.Mesh(geometry, material);
  tube.position.copy(startPoint);
  
  // orientation
  tube.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.clone().normalize());
  
  scene.add(tube);
}

// set the token color as it should be
function set_token_color_base(token_object) {
  let [x,y,z] = get_token_position(token_object);
  let player_token = game.getToken(x, y, z);
  if (player_token === 0) {
    token_object.material.opacity = 0.0;
  } else if (player_token === 1) {
    token_object.material.color.set(color_token1);
    token_object.material.opacity = opacity_base;
  } else {
    token_object.material.color.set(color_token2);
    token_object.material.opacity = opacity_base;
  }
}

// set the token color as if it is being hovered over
function set_token_color_hover(token_object) {
  token_object.material.opacity = opacity_hover;
  if (game.getTurn() === 1) {
    token_object.material.color.set(color_token1);
  } else {
    token_object.material.color.set(color_token2);
  }
}





//////////////// game mechanics ////////////////

const update_mouse_position = function(e) {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1;
};

const update_touch_position = function(e) {
  e.preventDefault();
  const touch = e.touches[0];
  update_mouse_position({
    clientX: touch.clientX,
    clientY: touch.clientY
  });
};

const press_function = function(e) {

  // get intersections
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(tokens);

  // break if there is no intersection
  if (intersects.length === 0) {
    return;
  }
  
  // break if not a valid move
  let curr_token = intersects[0].object;
  let [x,y,z] = get_token_position(curr_token);
  if (!game.validMove(x,y,z)) {
    return;
  }

  // make move
  game.makeMove(x,y,z);
  set_token_color_base(curr_token);
  set_game_state_div();
  if (game.gameOver()) {
    set_solution();
  } else {

    // if single player, let ai make move
    if (game_mode === "easy") {
      game.makeAIMove();
      set_token_color_base(curr_token);
      set_game_state_div();
      if (game.gameOver()) {
        set_solution();
      }
    }
    

  }

}


// select objects to make move
window.addEventListener('touchstart', function(e) {
  update_touch_position(e);
  press_function(e);
});

window.addEventListener('mousedown', function(e) {
  update_mouse_position(e);
  press_function(e);
});


// update hovering token color
let prev_hover_token = undefined;
function update_token_hover() {

  // get intersections
  rayCaster.setFromCamera(mousePosition, camera);
  const intersects = rayCaster.intersectObjects(tokens);
  
  // re-set previous hover
  if (prev_hover_token !== undefined) {
    set_token_color_base(prev_hover_token)
  }

  // break if there is no intersection
  if (intersects.length === 0) {
    return;
  }

  // break if not a valid move
  let curr_hover_token = intersects[0].object
  let [x,y,z] = get_token_position(curr_hover_token);
  if (!game.validMove(x,y,z)) {
    return;
  }

  // set current hover
  set_token_color_hover(curr_hover_token);
  
  // update next previous
  prev_hover_token = curr_hover_token;
  
}


// animate loop
function animate() {
  

  // update hover
  update_token_hover();

  // render frame
  renderer.render(scene, camera);
}


// update mouse position
window.addEventListener('mousemove', update_mouse_position);

// check for resizing window
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
  console.error("This Browser Does Not Support WebGL");
}
