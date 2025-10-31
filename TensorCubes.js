// Three.js cube stacking animation with neural network learning

console.log("Script starting...");

import * as THREE from "three";

console.log("THREE module loaded:", typeof THREE);
console.log("THREE.WebGLRenderer available:", typeof THREE.WebGLRenderer);

let renderer, scene, camera;

try {
  console.log("Creating WebGL renderer...");
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(400, 400);
  renderer.setClearColor(0x444444); // Lighter background
  console.log("Renderer created successfully");

  console.log("Creating scene...");
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
  camera.position.set(6, 6, 6);
  camera.lookAt(0, 1, 0);
  console.log("Scene and camera created successfully");
} catch (error) {
  console.error("Error creating Three.js components:", error);
}

scene.add(new THREE.AmbientLight("white", 0.4));
let point = new THREE.PointLight("white", 1, 0, 0);
point.position.set(10, 10, 10);
scene.add(point);

// Add directional light for better visibility
let directionalLight = new THREE.DirectionalLight("white", 0.8);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

// Ground plane
let groundBox = new THREE.BoxGeometry(5, 0.1, 5);
let groundMesh = new THREE.Mesh(
groundBox,
new THREE.MeshLambertMaterial({ color: 0x888888 })
);
groundMesh.position.y = -0.05;
scene.add(groundMesh);

// Create 3 cubes of different sizes
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

// Cube height definitions for stacking calculations
const heights = {
  box1: 1 * 2,    // Red cube height (scaled)
  box2: 1.5,      // Purple cube height
  box3: 1         // Blue cube height
};

// Stack cubes from bottom to top
let currentTop = 0;
const stackOrder = [
  { mesh: box1, height: heights.box1 },
  { mesh: box2, height: heights.box2 },
  { mesh: box3, height: heights.box3 }
];

for (const item of stackOrder) {
  const centerY = currentTop + item.height / 2;
  item.mesh.position.set(0, centerY, 0);
  currentTop = centerY + item.height / 2;
  console.log(`Positioned ${item.mesh.material.color.getStyle()} cube at y=${centerY}`);
}

// Add cubes to scene
scene.add(box1);
scene.add(box2);
scene.add(box3);

console.log("Scene setup complete:");
console.log("- Red cube position:", box1.position);
console.log("- Purple cube position:", box2.position);
console.log("- Blue cube position:", box3.position);
console.log("- Camera position:", camera.position);
console.log("- Scene children count:", scene.children.length);

document.getElementById("div1").appendChild(renderer.domElement);
console.log("Renderer canvas added to DOM");
console.log("Canvas size:", renderer.domElement.width, "x", renderer.domElement.height);

// Status display is now in the HTML, just set initial content
const statusDiv = document.getElementById('status');
if (statusDiv) {
    statusDiv.innerHTML = 'Phase 1: Direct Following';
}

// Animation control variables
let time = 0;
const radius = 1.5; // Circle radius for base cube movement
const speed = 0.02; // Animation speed

// Position and velocity tracking for 3 cubes
let previousPosition1 = { x: 0, y: 0, z: 0 };
let previousPosition2 = { x: 0, y: 0, z: 0 };
let previousPosition3 = { x: 0, y: 0, z: 0 };
let velocity1 = { x: 0, y: 0, z: 0 };
let velocity2 = { x: 0, y: 0, z: 0 };
let velocity3 = { x: 0, y: 0, z: 0 };

// Simple behavior function: move towards target with discrete actions
function simpleBehaviorFunction(state) {
    const [x, y, z, vx, vy, vz] = state;
    
    // Calculate relative position to target (should be 0,0,0 when perfectly aligned)
    const dx = x; // already relative position
    const dz = z; // already relative position
    
    // Initialize actions: [U, D, L, R, Forward, Back]
    let actions = [0, 0, 0, 0, 0, 0];
    
    // Horizontal movement rules (L/R)
    if (dx > 0.2) actions[2] = 1; // Move Left (reduce x)
    else if (dx < -0.2) actions[3] = 1; // Move Right (increase x)
    
    // Forward/Back movement rules
    if (dz > 0.2) actions[4] = 1; // Move Forward (reduce z)
    else if (dz < -0.2) actions[5] = 1; // Move Back (increase z)
    
    // Vertical adjustment (minor)
    if (y > 0.1) actions[1] = 0.3; // Move Down slightly
    else if (y < -0.1) actions[0] = 0.3; // Move Up slightly
    
    return actions;
}

// Generate training dataset using the simple behavior function
function generateTrainingData(numSamples = 1000) {
    const trainingSet = [];
    
    for (let i = 0; i < numSamples; i++) {
        // Random state: relative positions and velocities
        const state = [
            (Math.random() - 0.5) * 4, // x relative position
            (Math.random() - 0.5) * 2, // y relative position  
            (Math.random() - 0.5) * 4, // z relative position
            (Math.random() - 0.5) * 1, // x velocity
            (Math.random() - 0.5) * 1, // y velocity
            (Math.random() - 0.5) * 1  // z velocity
        ];
        
        // Apply simple behavior function to get actions
        const actions = simpleBehaviorFunction(state);
        
        trainingSet.push({ input: state, output: actions });
    }
    
    console.log(`Generated ${numSamples} training samples`);
    return trainingSet;
}

// Convert discrete actions to position adjustments
function actionsToMovement(actions) {
    const speed = 0.1;
    return {
        x: (actions[3] - actions[2]) * speed, // Right - Left
        y: (actions[0] - actions[1]) * speed, // Up - Down  
        z: (actions[5] - actions[4]) * speed  // Back - Forward
    };
}

// Pre-train all neural networks with generated data
async function preTrainNetworks() {
    if (networksPreTrained) return;
    
    console.log("Starting pre-training of all neural networks...");
    
    // Generate training data once
    if (!preTrainingData) {
        preTrainingData = generateTrainingData(2000);
    }
    
    const inputs = preTrainingData.map(sample => sample.input);
    const outputs = preTrainingData.map(sample => sample.output);
    
    const xs = tf.tensor2d(inputs);
    const ys = tf.tensor2d(outputs);
    
    try {
        // Pre-train all networks
        const networks = [qNetwork2, qNetwork3];
        const networkNames = ['Purple', 'Blue'];
        
        for (let i = 0; i < networks.length; i++) {
            if (networks[i]) {
                console.log(`Pre-training ${networkNames[i]} cube network...`);
                await networks[i].fit(xs, ys, { 
                    epochs: 20, 
                    batchSize: 32,
                    verbose: 0
                });
                console.log(`${networkNames[i]} cube pre-training completed!`);
            }
        }
        
        networksPreTrained = true;
        console.log("All networks pre-trained successfully!");
        
    } catch (error) {
        console.error("Pre-training error:", error);
    } finally {
        xs.dispose();
        ys.dispose();
    }
}

// Neural networks for learning cubes
let qNetwork2 = null; // Purple cube neural network
let qNetwork3 = null; // Blue cube neural network

// Initialize neural networks when TensorFlow is available
function initializeModel() {
  if (typeof tf !== 'undefined') {
    // Create neural network for purple cube
    if (!qNetwork2) {
      qNetwork2 = tf.sequential({
        layers: [
          tf.layers.dense({ inputShape: [6], units: 16, activation: 'relu' }),
          tf.layers.dense({ units: 8, activation: 'relu' }),
          tf.layers.dense({ units: 6, activation: 'sigmoid' }) // 6 outputs: U,D,L,R,Forward,Back
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
          tf.layers.dense({ units: 6, activation: 'sigmoid' }) // 6 outputs: U,D,L,R,Forward,Back
        ]
      });
      qNetwork3.compile({
        optimizer: tf.train.adam(0.01),
        loss: 'meanSquaredError'
      });
      console.log("Blue cube network initialized!");
    }
  }
}

// Learning control variables
let followingMode = true;
let globalLearningPhase = 0; // 0 = direct following, 1 = neural network learning
let correctionData2 = []; // Purple cube training data
let correctionData3 = []; // Blue cube training data
let frameCount = 0;
let isTraining2 = false; // Purple cube training status
let isTraining3 = false; // Blue cube training status
let trainingCount2 = 0; // Purple cube training sessions
let trainingCount3 = 0; // Blue cube training sessions

// Pre-training variables
let networksPreTrained = false;
let preTrainingData = null;

// Main animation loop
function animate() {
  time += speed;
  
  // Store previous positions for velocity calculation
  previousPosition1 = { x: box1.position.x, y: box1.position.y, z: box1.position.z };
  previousPosition2 = { x: box2.position.x, y: box2.position.y, z: box2.position.z };
  previousPosition3 = { x: box3.position.x, y: box3.position.y, z: box3.position.z };
  
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
    
    // Pre-train networks once after initialization
    if (!networksPreTrained && qNetwork2 && qNetwork3) {
        preTrainNetworks();
    }
    
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
  
  // Render the scene
  renderer.render(scene, camera);
  
  // Log every 60 frames to confirm animation is running
  if (frameCount % 60 === 0) {
    console.log(`Frame ${frameCount}, Red cube at:`, box1.position);
  }
  
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
      
      const actionPredictions = network.predict(state);
      const actions = actionPredictions.dataSync();
      
      // Convert actions to movement
      const movement = actionsToMovement(actions);
      
      learnerCube.position.x += movement.x;
      learnerCube.position.y += movement.y;
      learnerCube.position.z += movement.z;
      
      const horizontalError = Math.sqrt(
        Math.pow(learnerCube.position.x - targetCube.position.x, 2) + 
        Math.pow(learnerCube.position.z - targetCube.position.z, 2)
      );
      const verticalError = Math.abs(
        (learnerCube.position.y - learnerHeight/2) - (targetCube.position.y + targetHeight/2)
      );
      const reward = -(horizontalError + verticalError);
      
      // Store training data using the simple behavior function
      const currentState = state.dataSync();
      const idealActions = simpleBehaviorFunction(currentState);
      correctionData.push({ state: currentState, actions: actions, idealActions: idealActions });
      
      // Train occasionally
      if (correctionData.length > 50 && !isTraining) {
        trainCubeNetwork(cubeIndex);
      }
      
      state.dispose();
      actionPredictions.dispose();
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
    statusText += `Blue: Learning | Data: ${correctionData3.length}/50 | Trained: ${trainingCount3}`;
  }
  
  statusDiv.innerHTML = statusText;
  // Remove the background color override to let CSS handle it
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
  }
  
  if (!data || data.length < 10) {
    // Reset training flag and return
    if (cubeIndex === 2) isTraining2 = false;
    else if (cubeIndex === 3) isTraining3 = false;
    return;
  }
  
  try {
    const recentData = data.slice(-10);
    const states = recentData.map(d => d.state);
    const idealActions = recentData.map(d => d.idealActions);
    
    const stateTensor = tf.tensor2d(states);
    const targetTensor = tf.tensor2d(idealActions);
    
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
    }
    
    const currentCount = cubeIndex === 2 ? trainingCount2 : trainingCount3;
    console.log(`Cube ${cubeIndex} trained (session ${currentCount})`);
  } catch (error) {
    console.log(`Cube ${cubeIndex} training error:`, error);
  } finally {
    if (cubeIndex === 2) isTraining2 = false;
    else if (cubeIndex === 3) isTraining3 = false;
  }
}

// Start the animation
animate();