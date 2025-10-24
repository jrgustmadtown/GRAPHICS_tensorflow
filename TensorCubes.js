// @ts-check

import * as THREE from "three";


let renderer = new THREE.WebGLRenderer();
renderer.setSize(400, 400);

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera();
camera.position.z = 10;
camera.position.y = 5;
camera.position.x = 5;
camera.lookAt(0, 3, 0);

scene.add(new THREE.AmbientLight("white", 0.2));
let point = new THREE.PointLight("white", 1, 0, 0);
point.position.set(20, 10, 15);
scene.add(point);

// make a ground plane
let groundBox = new THREE.BoxGeometry(5, 0.1, 5);
let groundMesh = new THREE.Mesh(
groundBox,
new THREE.MeshLambertMaterial({ color: 0x888888 })
);
// put the top of the box at the ground level (0)
groundMesh.position.y = -0.05;
scene.add(groundMesh);

// make 5 boxes of different sizes - all cubes
let box1 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "red" })
  );
  box1.scale.set(2, 2, 2);
let box2 = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.5, 1.5),
    new THREE.MeshStandardMaterial({ color: "purple" })
  );
let box3 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "blue" })
  );
let box4 = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshStandardMaterial({ color: "cyan" })
  );
box4.scale.set(0.8, 0.8, 0.8);
  let box5 = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.5, 0.5),
    new THREE.MeshStandardMaterial({ color: "green" })
  );

// STUDENT: position them into a stack (biggest on the bottom)
const heights = {
  box1: 1 * 2,    // geometry 1 scaled by 2 -> height 2
  box2: 1.5,      // geometry 1.5
  box3: 1,        // geometry 1
  box4: 1 * 0.8,  // geometry 1 scaled by 0.8 -> height 0.8
  box5: 0.5       // geometry 0.5
};

let currentTop = 0;
const stackOrder = [
  { mesh: box1, height: heights.box1 },
  { mesh: box2, height: heights.box2 },
  { mesh: box3, height: heights.box3 },
  { mesh: box4, height: heights.box4 },
  { mesh: box5, height: heights.box5 }
];

for (const item of stackOrder) {
  const centerY = currentTop + item.height / 2;
  item.mesh.position.set(0, centerY, 0);
  // update top for next box
  currentTop = centerY + item.height / 2;
}

// add the boxes to the scene
scene.add(box1);
scene.add(box2);
scene.add(box3);
scene.add(box4);
scene.add(box5);

document.getElementById("div1").appendChild(renderer.domElement);
renderer.render(scene, camera);

// CS559 2025 Workbook