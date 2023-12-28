document.addEventListener("DOMContentLoaded", () => {
  const MAX_PHASE = 3; // Maximum phase
  const ANIMATION_COOLDOWN_MS = 1500;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  let centerX = canvas.width / 2; // Center X position
  let centerY = canvas.height / 2; // Center Y position
  let animationPhase = 0; // Starting animation phase
  let lastAnimationTime = 0;
  let animationProgress = 0; // New variable to track animation progress
  const ANIMATION_DURATION = 1500; // 1.5 seconds in milliseconds

  const atomMovements = {
    atom1: {
      phase1: {
        startX: canvas.width * -0.1,
        startY: canvas.height / 2,
        endX: centerX,
        endY: canvas.height / 2,
        controlX: centerX * 0.5,
        controlY: canvas.height * 0.3,
      },
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX + 150,
        endY: centerY - 150,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX + 150,
        startY: centerY - 150,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
    atom2: {
      phase1: {
        startX: canvas.width * 1.1,
        startY: canvas.height / 2,
        endX: centerX,
        endY: canvas.height / 2,
        controlX: centerX * 1.5,
        controlY: canvas.height * 0.7, // Adjust this value to move the curve lower
      },
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX + 250,
        endY: centerY + 0,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX + 250,
        startY: centerY + 0,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
    atom3: {
      phase1: {},
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX + 150,
        endY: centerY + 150,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX + 150,
        startY: centerY + 150,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
    atom4: {
      phase1: {},
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX - 150,
        endY: centerY + 150,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX - 150,
        startY: centerY + 150,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
    atom5: {
      phase1: {},
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX - 250,
        endY: centerY + 0,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX - 250,
        startY: centerY + 0,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
    atom6: {
      // azure
      phase1: {},
      phase2: {
        startX: centerX,
        startY: centerY,
        endX: centerX - 150,
        endY: centerY - 150,
        controlX: centerX,
        controlY: centerY,
      },
      phase3: {
        startX: centerX - 150,
        startY: centerY - 150,
        endX: centerX,
        endY: centerY,
        controlX: centerX,
        controlY: centerY,
      },
    },
  };

  const atoms = {
    atom1: { x: atomMovements.atom1.phase1.startX, y: atomMovements.atom1.phase1.startY, color: "brown" },
    atom2: { x: atomMovements.atom2.phase1.startX, y: atomMovements.atom2.phase1.startY, color: "red" },
    atom3: { x: atomMovements.atom3.phase1.startX, y: atomMovements.atom3.phase1.startY, color: "orange" },
    atom4: { x: atomMovements.atom4.phase1.startX, y: atomMovements.atom4.phase1.startY, color: "gold" },
    atom5: { x: atomMovements.atom5.phase1.startX, y: atomMovements.atom5.phase1.startY, color: "yellow" },
    atom6: { x: atomMovements.atom6.phase1.startX, y: atomMovements.atom6.phase1.startY, color: "aqua" },
    // Define other atoms with their initial positions and colors...
  };

  updateAnimation();

  window.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const direction = e.deltaY < 0 ? "up" : "down";
      triggerAnimation(direction);
    },
    { passive: false }
  );

  function drawSpecificAtoms(atomsObj) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(atomsObj).forEach(drawAtom);
  }

  function getQuadraticBezierPoint(t, p0, p1, p2) {
    const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
    const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
    return { x, y };
  }

  function easeOutQuadratic(t) {
    return t * (2 - t);
  }

  function drawAtom(atom) {
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 20, 0, 2 * Math.PI); // Adjust the size as needed
    ctx.fillStyle = atom.color;
    ctx.fill();
  }

  function canAnimate() {
    const currentTime = Date.now();
    return currentTime - lastAnimationTime > ANIMATION_COOLDOWN_MS;
  }

  function updatePhase(direction) {
    if (direction === "up" && animationPhase > 0) {
      animationPhase--;
    } else if (direction === "down" && animationPhase < MAX_PHASE) {
      animationPhase++;
    }
    if (canAnimate()) {
      animationProgress = 0; // Reset progress
      lastAnimationTime = Date.now(); // Reset last animation time
      animatePhase();
    }
  }

  function animatePhase() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastAnimationTime;
    let linearProgress = elapsedTime / ANIMATION_DURATION;

    if (linearProgress >= 1) {
        linearProgress = 1; // Cap the progress at 100%
        lastAnimationTime = currentTime;
    } else {
        requestAnimationFrame(animatePhase); // Continue animation
    }

    animationProgress = easeOutQuadratic(linearProgress); // Apply easing
    updateAnimation();
}

  function phase0Animation() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function phase1Animation() {
    // Use `animationProgress` for gradual movement
    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey].phase1;
      if (!movement) return;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };

      let newPos = getQuadraticBezierPoint(animationProgress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function phase2Animation() {
    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey]?.phase2;
      if (!movement) return;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };

      let newPos = getQuadraticBezierPoint(animationProgress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function phase3Animation() {
    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey]?.phase3;
      if (!movement) return;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };

      let newPos = getQuadraticBezierPoint(animationProgress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function updateAnimation() {
    switch (animationPhase) {
      case 0:
        phase0Animation();
        break;
      case 1:
        phase1Animation();
        break;
      case 2:
        phase2Animation();
        break;
      case 3:
        phase3Animation();
        break;
    }
  }

  function triggerAnimation(direction) {
    if (canAnimate()) {
      updatePhase(direction);
    }
  }
});
