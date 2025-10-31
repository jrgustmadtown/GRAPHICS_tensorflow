// Three.js cube stacking animation with neural network learning

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

// Ground plane
let groundBox = new THREE.BoxGeometry(5, 0.1, 5);
let groundMesh = new THREE.Mesh(
groundBox,
new THREE.MeshLambertMaterial({ color: 0x888888 })
);
groundMesh.position.y = -0.05;
scene.add(groundMesh);

// Create 5 cubes of different sizes
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

// Cube height definitions for stacking calculations
const heights = {
  box1: 1 * 2,    // Red cube height (scaled)
  box2: 1.5,      // Purple cube height
  box3: 1,        // Blue cube height
  box4: 1 * 0.8,  // Cyan cube height (scaled)
  box5: 0.5       // Green cube height
};

// Stack cubes from bottom to top
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
  currentTop = centerY + item.height / 2;
}

// Add cubes to scene
scene.add(box1);
scene.add(box2);
scene.add(box3);
scene.add(box4);
scene.add(box5);

document.getElementById("div1").appendChild(renderer.domElement);

// Create status display overlay
const statusDiv = document.createElement('div');
statusDiv.id = 'status';
statusDiv.style.position = 'absolute';
statusDiv.style.top = '10px';
statusDiv.style.left = '10px';
statusDiv.style.color = 'white';
statusDiv.style.fontSize = '16px';
statusDiv.style.fontFamily = 'Arial, sans-serif';
statusDiv.style.backgroundColor = 'rgba(0,0,0,0.7)';
statusDiv.style.padding = '10px';
statusDiv.style.borderRadius = '5px';
statusDiv.innerHTML = 'Phase 1: Direct Following';
document.getElementById("div1").appendChild(statusDiv);

// Animation control variables
let time = 0;
const radius = 1.5; // Circle radius for base cube movement
const speed = 0.02; // Animation speed

// Position and velocity tracking for all cubes
let previousPosition1 = { x: 0, y: 0, z: 0 };
let previousPosition2 = { x: 0, y: 0, z: 0 };
let previousPosition3 = { x: 0, y: 0, z: 0 };
let previousPosition4 = { x: 0, y: 0, z: 0 };
let previousPosition5 = { x: 0, y: 0, z: 0 };
let velocity1 = { x: 0, y: 0, z: 0 };
let velocity2 = { x: 0, y: 0, z: 0 };
let velocity3 = { x: 0, y: 0, z: 0 };
let velocity4 = { x: 0, y: 0, z: 0 };
let velocity5 = { x: 0, y: 0, z: 0 };

// Neural networks for each learning cube
let qNetwork2 = null; // Purple cube neural network
let qNetwork3 = null; // Blue cube neural network
let qNetwork4 = null; // Cyan cube neural network
let qNetwork5 = null; // Green cube neural network

// Initialize neural networks when TensorFlow is available
function initializeModel() {
  if (typeof tf !== 'undefined') {
    // Create neural network for purple cube
    if (!qNetwork2) {
      qNetwork2 = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'tanh' })
        ]
      });
      qNetwork2.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      console.log("Purple cube network initialized!");
    }
    
    // Create neural network for blue cube
    if (!qNetwork3) {
      qNetwork3 = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'tanh' })
        ]
      });
      qNetwork3.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      console.log("Blue cube network initialized!");
    }
    
    // Create neural network for cyan cube
    if (!qNetwork4) {
      qNetwork4 = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'tanh' })
        ]
      });
      qNetwork4.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      console.log("Cyan cube network initialized!");
    }
    
    // Create neural network for green cube
    if (!qNetwork5) {
      qNetwork5 = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 3, activation: 'tanh' })
        ]
      });
      qNetwork5.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      console.log("Green cube network initialized!");
    }
  }
}

// Learning control variables
let followingMode = true;
let globalLearningPhase = 0; // 0 = direct following, 1 = neural network learning
let correctionData2 = []; // Purple cube training data
let correctionData3 = []; // Blue cube training data
let correctionData4 = []; // Cyan cube training data
let correctionData5 = []; // Green cube training data
let frameCount = 0;
let isTraining2 = false; // Purple cube training status
let isTraining3 = false; // Blue cube training status
let isTraining4 = false; // Cyan cube training status
let isTraining5 = false; // Green cube training status
let trainingCount2 = 0; // Purple cube training sessions
let trainingCount3 = 0; // Blue cube training sessions
let trainingCount4 = 0; // Cyan cube training sessions
let trainingCount5 = 0; // Green cube training sessions

// Main animation loop
function animate() {
  time += speed;
  
  // Store previous positions for velocity calculation
  previousPosition1 = { x: box1.position.x, y: box1.position.y, z: box1.position.z };
  previousPosition2 = { x: box2.position.x, y: box2.position.y, z: box2.position.z };
  previousPosition3 = { x: box3.position.x, y: box3.position.y, z: box3.position.z };
  previousPosition4 = { x: box4.position.x, y: box4.position.y, z: box4.position.z };
  previousPosition5 = { x: box5.position.x, y: box5.position.y, z: box5.position.z };
  
  // Calculate circular movement for red cube
  const x = Math.cos(time) * radius;
  const z = Math.sin(time) * radius;
  
  // Update red cube velocity
  velocity1.x = x - previousPosition1.x;
  velocity1.y = 0;
  velocity1.z = z - previousPosition1.z;
  
  // Move red cube in circle
  box1.position.set(x, box1.position.y, z);
  
  // Initialize neural networks if TensorFlow is loaded
  if (typeof tf !== 'undefined') {
    initializeModel();
    frameCount++;
    
    // Switch to learning mode after 600 frames (10 seconds)
    if (globalLearningPhase === 0 && frameCount >= 600) {
      globalLearningPhase = 1;
      console.log("All cubes switching to learning mode...");
    }
    
    // Handle cube learning for each cube
    if (qNetwork2) {
      handleCubeLearning(box2, box1, heights.box2, heights.box1, qNetwork2, 
                        correctionData2, isTraining2, trainingCount2, velocity1, 'Purple', 2);
    }
    if (qNetwork3) {
      handleCubeLearning(box3, box2, heights.box3, heights.box2, qNetwork3, 
                        correctionData3, isTraining3, trainingCount3, velocity2, 'Blue', 3);
    }
    if (qNetwork4) {
      handleCubeLearning(box4, box3, heights.box4, heights.box3, qNetwork4, 
                        correctionData4, isTraining4, trainingCount4, velocity3, 'Cyan', 4);
    }
    if (qNetwork5) {
      handleCubeLearning(box5, box4, heights.box5, heights.box4, qNetwork5, 
                        correctionData5, isTraining5, trainingCount5, velocity4, 'Green', 5);
    }
    
    // Update status display
    updateStatusDisplay();
  } else {
    console.log("TensorFlow.js not loaded yet");
  }
  
  // Calculate velocities for all cubes
  velocity2.x = box2.position.x - previousPosition2.x;
  velocity2.y = box2.position.y - previousPosition2.y;
  velocity2.z = box2.position.z - previousPosition2.z;
  
  velocity3.x = box3.position.x - previousPosition3.x;
  velocity3.y = box3.position.y - previousPosition3.y;
  velocity3.z = box3.position.z - previousPosition3.z;
  
  velocity4.x = box4.position.x - previousPosition4.x;
  velocity4.y = box4.position.y - previousPosition4.y;
  velocity4.z = box4.position.z - previousPosition4.z;
  
  velocity5.x = box5.position.x - previousPosition5.x;
  velocity5.y = box5.position.y - previousPosition5.y;
  velocity5.z = box5.position.z - previousPosition5.z;
  
  // Render the scene
  renderer.render(scene, camera);
  
  // Continue the animation
  requestAnimationFrame(animate);
}

// Handle learning for a specific cube following another cube
function handleCubeLearning(learnerCube, targetCube, learnerHeight, targetHeight, 
                           network, correctionData, isTraining, trainingCount, 
                           targetVelocity, cubeName, cubeIndex) {
  
  if (!network) return;
  
  try {
    const targetX = targetCube.position.x;
    const targetZ = targetCube.position.z;
    const targetY = targetCube.position.y + targetHeight/2 + learnerHeight/2;
    
    if (globalLearningPhase === 0) {
      // Phase 1: Direct following for all cubes
      learnerCube.position.x += (targetX - learnerCube.position.x) * 0.3;
      learnerCube.position.z += (targetZ - learnerCube.position.z) * 0.3;
      learnerCube.position.y += (targetY - learnerCube.position.y) * 0.2;
    } else {
      // Phase 2: Neural network learning for all cubes
      learnerCube.position.x += (targetX - learnerCube.position.x) * 0.02;
      learnerCube.position.z += (targetZ - learnerCube.position.z) * 0.02;
      learnerCube.position.y += (targetY - learnerCube.position.y) * 0.02;
      
      const state = tf.tensor2d([[
        learnerCube.position.x - targetCube.position.x,
        learnerCube.position.z - targetCube.position.z,
        targetVelocity.x,
        targetVelocity.z,
        Math.sin(time),
        Math.cos(time)
      ]]);
      
      const corrections = network.predict(state);
      const correctionArray = corrections.dataSync();
      
      learnerCube.position.x += correctionArray[0] * 0.15;
      learnerCube.position.y += correctionArray[1] * 0.15;
      learnerCube.position.z += correctionArray[2] * 0.15;
      
      const horizontalError = Math.sqrt(
        Math.pow(learnerCube.position.x - targetCube.position.x, 2) + 
        Math.pow(learnerCube.position.z - targetCube.position.z, 2)
      );
      const verticalError = Math.abs(
        (learnerCube.position.y - learnerHeight/2) - (targetCube.position.y + targetHeight/2)
      );
      const reward = -(horizontalError + verticalError);
      
      // Store training data in the appropriate array
      correctionData.push({ state: state.dataSync(), corrections: correctionArray, reward });
      
      // Train occasionally
      if (correctionData.length > 50 && !isTraining) {
        trainCubeNetwork(cubeIndex);
      }
      
      state.dispose();
      corrections.dispose();
    }
  } catch (error) {
    console.log(`${cubeName} cube error:`, error);
  }
}

// Update status display for all cubes
function updateStatusDisplay() {
  const statusDiv = document.getElementById('status');
  if (!statusDiv) return;
  
  let statusText = '';
  
  if (globalLearningPhase === 0) {
    // All cubes in direct following phase
    const remaining = Math.ceil((600 - frameCount) / 60);
    statusText = `All Cubes: Direct Following (${Math.max(0, remaining)}s remaining)`;
  } else {
    // All cubes in learning phase
    statusText += `Purple: Learning | Data: ${correctionData2.length}/50 | Trained: ${trainingCount2}<br>`;
    statusText += `Blue: Learning | Data: ${correctionData3.length}/50 | Trained: ${trainingCount3}<br>`;
    statusText += `Cyan: Learning | Data: ${correctionData4.length}/50 | Trained: ${trainingCount4}<br>`;
    statusText += `Green: Learning | Data: ${correctionData5.length}/50 | Trained: ${trainingCount5}`;
  }
  
  statusDiv.innerHTML = statusText;
  statusDiv.style.backgroundColor = globalLearningPhase > 0 ? 'rgba(255,165,0,0.8)' : 'rgba(0,0,0,0.7)';
}

// Train specific cube network
async function trainCubeNetwork(cubeIndex) {
  let data, isTraining, network, trainingCount;
  
  if (cubeIndex === 2) {
    data = correctionData2; isTraining = isTraining2; network = qNetwork2; trainingCount = trainingCount2;
    if (isTraining2) return; isTraining2 = true;
  } else if (cubeIndex === 3) {
    data = correctionData3; isTraining = isTraining3; network = qNetwork3; trainingCount = trainingCount3;
    if (isTraining3) return; isTraining3 = true;
  } else if (cubeIndex === 4) {
    data = correctionData4; isTraining = isTraining4; network = qNetwork4; trainingCount = trainingCount4;
    if (isTraining4) return; isTraining4 = true;
  } else if (cubeIndex === 5) {
    data = correctionData5; isTraining = isTraining5; network = qNetwork5; trainingCount = trainingCount5;
    if (isTraining5) return; isTraining5 = true;
  }
  
  if (!data || data.length < 10) {
    // Reset training flag and return
    if (cubeIndex === 2) isTraining2 = false;
    else if (cubeIndex === 3) isTraining3 = false;
    else if (cubeIndex === 4) isTraining4 = false;
    else if (cubeIndex === 5) isTraining5 = false;
    return;
  }
  
  try {
    const recentData = data.slice(-10);
    const states = recentData.map(d => d.state);
    const idealCorrections = recentData.map(d => {
      const horizontalErrorX = d.state[0];
      const horizontalErrorZ = d.state[1];
      const targetVelX = d.state[2];
      const targetVelZ = d.state[3];
      
      return [
        -horizontalErrorX * 0.5 + targetVelX * 2,
        0,
        -horizontalErrorZ * 0.5 + targetVelZ * 2
      ];
    });
    
    const stateTensor = tf.tensor2d(states);
    const targetTensor = tf.tensor2d(idealCorrections);
    
    await network.fit(stateTensor, targetTensor, { epochs: 1, verbose: 0 });
    
    stateTensor.dispose();
    targetTensor.dispose();
    
    // Update data and counters
    if (cubeIndex === 2) {
      correctionData2 = correctionData2.slice(-30);
      trainingCount2++;
    } else if (cubeIndex === 3) {
      correctionData3 = correctionData3.slice(-30);
      trainingCount3++;
    } else if (cubeIndex === 4) {
      correctionData4 = correctionData4.slice(-30);
      trainingCount4++;
    } else if (cubeIndex === 5) {
      correctionData5 = correctionData5.slice(-30);
      trainingCount5++;
    }
    
    const currentCount = cubeIndex === 2 ? trainingCount2 : cubeIndex === 3 ? trainingCount3 : 
                        cubeIndex === 4 ? trainingCount4 : trainingCount5;
    console.log(`Cube ${cubeIndex} trained (session ${currentCount})`);
  } catch (error) {
    console.log(`Cube ${cubeIndex} training error:`, error);
  } finally {
    if (cubeIndex === 2) isTraining2 = false;
    else if (cubeIndex === 3) isTraining3 = false;
    else if (cubeIndex === 4) isTraining4 = false;
    else if (cubeIndex === 5) isTraining5 = false;
  }
}

// Start the animation
animate();