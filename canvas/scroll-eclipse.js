document.addEventListener("DOMContentLoaded", () => {
  const THROTTLE_WHEEL_MS = 50;
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  let scrollPosition = 1;

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let centerX = canvas.width / 2; // Center X position
  let centerY = canvas.height / 2; // Center X position

  const MAX_SCROLL_POSITION = 1000; // Define the maximum scroll value
  const maxScrollPhase1 = 300;
  const maxScrollPhase2 = 600;
  const maxScrollPhase3 = 900;

  // Define specific start and end points for each phase
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

  drawSpecificAtoms({ atom1: atoms.atom1, atom2: atoms.atom2 });

  // Define drawAtom function here to ensure it has access to ctx
  function drawAtom(atom) {
    ctx.beginPath();
    ctx.arc(atom.x, atom.y, 20, 0, 2 * Math.PI);
    ctx.fillStyle = atom.color;
    ctx.fill();
  }

  function interpolate(start, end, progress) {
    return start + (end - start) * progress;
  }

  function phase1Animation(scrollPos) {
    let progress = Math.min(scrollPos / maxScrollPhase1, 1);

    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey].phase1;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };

      let newPos = getQuadraticBezierPoint(progress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function phase2Animation(scrollPos) {
    let progress = Math.min((scrollPos - maxScrollPhase1) / (maxScrollPhase2 - maxScrollPhase1), 1);

    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey]?.phase2;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };
      let newPos = getQuadraticBezierPoint(progress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function phase3Animation(scrollPos) {
    let progress = Math.min((scrollPos - maxScrollPhase2) / (maxScrollPhase3 - maxScrollPhase2), 1);

    Object.keys(atomMovements).forEach((atomKey) => {
      let atom = atoms[atomKey];
      let movement = atomMovements[atomKey]?.phase3;
      let p0 = { x: movement.startX, y: movement.startY };
      let p1 = { x: movement.controlX, y: movement.controlY };
      let p2 = { x: movement.endX, y: movement.endY };
      let newPos = getQuadraticBezierPoint(progress, p0, p1, p2);
      atom.x = newPos.x;
      atom.y = newPos.y;
    });

    drawSpecificAtoms(atoms);
  }

  function updateAnimation(scrollPos) {
    const scrollPercent = (scrollPos / MAX_SCROLL_POSITION) * 100;
    if (scrollPercent <= 33) {
      phase1Animation(scrollPos);
    } else if (scrollPercent <= 66) {
      phase2Animation(scrollPos);
    } else {
      phase3Animation(scrollPos);
    }
  }

  function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function () {
      const context = this;
      const args = arguments;
      if (!lastRan) {
        func.apply(context, args);
        lastRan = Date.now();
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(function () {
          if (Date.now() - lastRan >= limit) {
            func.apply(context, args);
            lastRan = Date.now();
          }
        }, limit - (Date.now() - lastRan));
      }
    };
  }

  function drawSpecificAtoms(atomsObj) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    Object.values(atomsObj).forEach(drawAtom);
  }

  function getQuadraticBezierPoint(t, p0, p1, p2) {
    const x = (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t ** 2 * p2.x;
    const y = (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t ** 2 * p2.y;
    return { x, y };
  }

  // Define throttledUpdate inside the DOMContentLoaded
  const throttledUpdate = throttle((e) => {
    e.preventDefault();
    scrollPosition += e.deltaY;
    scrollPosition = Math.max(0, Math.min(scrollPosition, MAX_SCROLL_POSITION));
    updateAnimation(scrollPosition);
  }, THROTTLE_WHEEL_MS);

  // Attach the wheel event listener inside the DOMContentLoaded
  window.addEventListener("wheel", throttledUpdate, { passive: false });
});
