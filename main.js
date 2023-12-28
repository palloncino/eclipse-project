// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 1);
document.body.appendChild(renderer.domElement);

let currentBgColor = new THREE.Color(0xffffff); // Starting color: white

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener("mousemove", onMouseMove, false);

// Sphere Creation
const sphereGeometry = new THREE.SphereGeometry(0.3, 32, 32);
const SPHERES_COLORS = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff];
const sphereMaterials = SPHERES_COLORS.map((color) => new THREE.MeshStandardMaterial({ color }));

const spheres = sphereMaterials.map((material) => new THREE.Mesh(sphereGeometry, material));

// Text Loading
const loader = new THREE.FontLoader();
loader.load("./font.json", addTextToSpheres);

spheres.forEach((sphere) => setSphereTextVisibility(sphere, false));

spheres.forEach((sphere, index) => {
  sphere.visible = index < 2; // Only the first two spheres are initially visible
  scene.add(sphere);
});

// Initial Positions
const initialPositions = [
  { x: -2, y: 2, z: 0 }, // red
  { x: 2, y: -2, z: 0 }, // green
  { x: 0, y: 0, z: 0 }, // blue
  { x: 0, y: 0, z: 0 }, // yellow
  { x: 0, y: 0, z: 0 }, // aqua
  { x: 0, y: 0, z: 0 }, // pink
];

spheres.forEach((sphere, index) => {
  sphere.position.set(initialPositions[index]?.x || 0, initialPositions[index]?.y || 0, 0);
});

// Animation Variables
const movementDuration = 5; // seconds
const frameRate = 60; // frames per second
let animationTime = 0;
let phase = "floating"; // "floating", "eclipse", "scatter"
let scatterStartTime;
let whiteningPhase = false; // New phase for whitening effect
let colorChangeTime = 0; // Time tracker for the whitening phase

// Ellipse Parameters
const ellipseXRadius = 0.5; // Radius of ellipse along the x-axis
const ellipseYRadius = 0.25; // Radius of ellipse along the y-axis
const ellipseSpeed = 0.01; // Reduced speed for slower movement

// Easing Functions
function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}

function easeOutExpo(x) {
  return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
}

// Floating Phase Logic
function floatingPhase(sphere, index) {
  let time = frameCount * ellipseSpeed;

  // Check if the sphere is the first one (red ball)
  if (index === 0) {
    // Rotate in the opposite direction for the red ball
    sphere.position.x = initialPositions[index].x + ellipseXRadius * Math.cos(-time);
    sphere.position.y = initialPositions[index].y + ellipseYRadius * Math.sin(-time);
  } else {
    // Original rotation direction for other spheres
    sphere.position.x = initialPositions[index].x + ellipseXRadius * Math.cos(time);
    sphere.position.y = initialPositions[index].y + ellipseYRadius * Math.sin(time);
  }
}

// Eclipse Phase Logic
function eclipsePhase(sphere, initialPosition, index) {
  animationTime += 0.001; // Increment the animation time
  if (animationTime > 1) {
    animationTime = 1; // Cap the animation time to prevent overshooting
  }

  let progress = easeOutExpo(animationTime);
  sphere.position.x = THREE.MathUtils.lerp(initialPosition.x, 0, progress);
  sphere.position.y = THREE.MathUtils.lerp(initialPosition.y, 0, progress);

  // Gradually change the color of the sphere to a darker shade
  let currentColor = new THREE.Color(SPHERES_COLORS[index]); // Original color
  let targetColor = new THREE.Color(0x000000); // Target color (dark black)
  sphere.material.color.copy(currentColor).lerp(targetColor, progress);

  if (index === 0 && progress >= 0.95) {
    // Enlarging the first sphere logic
    sphere.position.z = -1 * easeOutExpo(progress - 0.95); // Move it back along z-axis
    let scaleFactor = 1 + easeOutExpo(progress - 0.95) * 0.35; // Scale up, adjust to control max size
    sphere.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  // Trigger the whitening phase for the first sphere when the eclipse is complete
  if (index === 0 && animationTime === 1) {
    whiteningPhase = true;
  }
}


// Target positions for each sphere
const targets = [
  { x: -1, y: 2 }, // red
  { x: 1, y: 2 }, // green
  { x: 2, y: 0 }, // blue
  { x: 1, y: -2 }, // yellow
  { x: -1, y: -2 }, // aqua
  { x: -2, y: 0 }, // pink
];

function moveToTarget(sphere, target, startTime, currentTime) {
  const duration = movementDuration * 1000; // Convert to milliseconds
  let timeElapsed = currentTime - startTime;
  if (timeElapsed > duration) timeElapsed = duration;

  let progress = easeOutExpo(timeElapsed / duration);
  sphere.position.x = THREE.MathUtils.lerp(sphere.position.x, target.x, progress);
  sphere.position.y = THREE.MathUtils.lerp(sphere.position.y, target.y, progress);
}

// Event Listener for Phase Transition
renderer.domElement.addEventListener("click", onPhaseChange);

let frameCount = 0; // Initialize frameCount

function onMouseMove(event) {
  // Calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function addTextToSpheres(font) {
  const textHeight = 0.03; // Height of the text
  const radiusOffset = 0.35; // Distance from the sphere's surface
  const labels = ["Analisi Dati", "Sviluppo", "Marketing", "Progetti", "Ricerche", "Contatti"];

  spheres.forEach((sphere, index) => {
    const label = labels[index];
    const textGeometry = new THREE.TextGeometry(label, {
      font: font,
      size: 0.15,
      height: textHeight,
    });

    const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);

    // Position the text on top of the sphere
    textGeometry.computeBoundingBox();
    const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
    textMesh.position.set(-textWidth / 2, sphere.geometry.parameters.radius + radiusOffset, 0);

    // Add textMesh to textGroup for easier manipulation
    const textGroup = new THREE.Group();
    textGroup.add(textMesh);
    sphere.add(textGroup);
  });
}

function onPhaseChange() {
  if (phase === "floating") {
    phase = "eclipse";
    animationTime = 0;
    // Update initialPositions to current position
    spheres.forEach((sphere, index) => {
      initialPositions[index] = { x: sphere.position.x, y: sphere.position.y, z: sphere.position.z };
    });
  } else if (phase === "eclipse") {
    phase = "scatter";
    scatterStartTime = Date.now();
    spheres.forEach((sphere, index) => {
      sphere.visible = true;
      sphere.material.color.set(SPHERES_COLORS[index]);
    });
  } else if (phase === "scatter") {
    spheres.forEach((sphere) => setSphereTextVisibility(sphere, true));
  }
}

function animate() {
  requestAnimationFrame(animate);
  frameCount++;

  let currentTime = Date.now();

  // Update the raycaster with the current mouse position
  raycaster.setFromCamera(mouse, camera);

  // Calculate objects intersecting the picking ray
  const intersects = phase === "scatter" ? raycaster.intersectObjects(spheres) : [];

  spheres.forEach((sphere, index) => {
    // Handle sphere movement based on phase
    if (phase === "floating") {
      floatingPhase(sphere, index);
    } else if (phase === "eclipse") {
      eclipsePhase(sphere, initialPositions[index] || { x: 0, y: 0, z: 0 }, index);
      let colorProgress = new THREE.Color(0xffffff).lerp(new THREE.Color(0x000000), animationTime);
      renderer.setClearColor(colorProgress);
    } else if (phase === "scatter") {
      moveToTarget(sphere, targets[index], scatterStartTime, currentTime);
    }

    // Set text visibility based on the phase
    setSphereTextVisibility(sphere, phase === "scatter");

    // Scale spheres on hover only in the scatter phase
    if (phase === "scatter") {
      if (intersects.length > 0 && intersects[0].object === sphere) {
        // Scale up the hovered sphere
        sphere.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        // Scale down the non-hovered spheres
        sphere.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }
  });

  spheres.forEach((sphere) => {
    sphere.children.forEach((child) => {
      if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TextGeometry) {
        child.lookAt(camera.position);
      }
    });
  });

  if (whiteningPhase) {
    // Increment whitening timer
    colorChangeTime += 0.001;
    if (colorChangeTime > 3) colorChangeTime = 3; // Cap at 3 seconds

    let colorChangeProgress = easeOutExpo(colorChangeTime / 3);
    spheres[0].material.color.lerp(new THREE.Color(0xffffff), colorChangeProgress);

    // Add light emission effect
    // This could involve adding a PointLight to the sphere or changing its emissive properties
  }

  renderer.render(scene, camera);
}


function setSphereTextVisibility(sphere, isVisible) {
  sphere.children.forEach((child) => {
    child.visible = isVisible; // Set visibility based on the passed parameter
  });
}

animate();
