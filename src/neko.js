// oneko.js: https://github.com/adryd325/oneko.js

(function frogFollow() {
  const frogEl = document.createElement("div");
  const frameW = 32;
  const frameH = 32;
  const scale = 4.5;
  const idleFrames = 5;
  const jumpFrames = 8;
  const directionRows = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];
  const boxEl = document.getElementById("game-box");

  const clownSheet = "/sprites/frog-fly.png";
  const croakRows = [0, 1, 2];

  const judgeSheet = "/sprites/frog-judge.png";

  const costumes = [
    { idle: "/sprites/frog-idle.png", jump: "/sprites/frog-jump.png", hurt: "/sprites/frog-hurt.png" },
  ];
  let currentCostume = costumes[0];

  let posX = 100, posY = 100;
  let mouseX = 0, mouseY = 0;
  let frame = 0;
  let lastTime = 0;
  let isHeld = false;
  let holdOffsetX = 0, holdOffsetY = 0;

  let frozenUntil = 0;
  let croakFrameCount = 0;
  let lastCroakTick = 0;
  const croakSpeed = 300;

  let lastDeathState = "alive";
  let judging = false;
  let judgingFrameCount = 0;
  let lastJudgingTick = 0;
  const judgingSpeed = 300;
  const judgingFrames = 2;

  frogEl.style.position = "fixed";
  frogEl.style.width = `${frameW}px`;
  frogEl.style.height = `${frameH}px`;
  frogEl.style.transform = `scale(${scale})`;
  frogEl.style.transformOrigin = "top left";
  frogEl.style.imageRendering = "pixelated";
  frogEl.style.zIndex = "5";
  frogEl.style.cursor = "grab";
  document.body.appendChild(frogEl);

  const flyEl = document.createElement("div");
  const flyFrameW = 32;
  const flyFrameH = 32;
  const flyScale = 3.5;
  flyEl.style.position = "fixed";
  flyEl.style.width = `${flyFrameW}px`;
  flyEl.style.height = `${flyFrameH}px`;
  flyEl.style.backgroundImage = "url('/sprites/fly.png')";
  flyEl.style.transform = `scale(${flyScale})`;
  flyEl.style.transformOrigin = "top left";
  flyEl.style.zIndex = "5";
  flyEl.style.imageRendering = "pixelated";
  flyEl.style.left = "200px";
  flyEl.style.top = "200px";
  document.body.appendChild(flyEl);

  function isInsideBox(x, y, padding = 0) {
    if (!boxEl) return false;
    const rect = boxEl.getBoundingClientRect();
    return (
      x > rect.left - padding &&
      x < rect.right + padding &&
      y > rect.top - padding &&
      y < rect.bottom + padding
    );
  }

  function getShrunkRect(el, shrinkPercent = 0.3) {
    const rect = el.getBoundingClientRect();
    const shrinkX = rect.width * shrinkPercent;
    const shrinkY = rect.height * shrinkPercent;
    return {
      left: rect.left + shrinkX,
      right: rect.right - shrinkX,
      top: rect.top + shrinkY,
      bottom: rect.bottom - shrinkY,
    };
  }

  let flyTargetX = 100, flyTargetY = 100;
  let lastFlyTargetTime = 0;

  function pickNewFlyTarget() {
    let x, y, tries = 0;
    do {
      x = Math.random() * (window.innerWidth - 60) + 30;
      y = Math.random() * (window.innerHeight - 60) + 30;
      tries++;
    } while (isInsideBox(x, y, 30) && tries < 20);
    flyTargetX = x;
    flyTargetY = y;
  }
  pickNewFlyTarget();

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (isHeld) {
      posX = mouseX - holdOffsetX;
      posY = mouseY - holdOffsetY;
      frogEl.style.left = `${posX - (frameW * scale) / 2}px`;
      frogEl.style.top = `${posY - (frameH * scale) / 2}px`;
    }
  });

  frogEl.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return;
    isHeld = true;
    frogEl.style.cursor = "grabbing";
    holdOffsetX = e.clientX - posX;
    holdOffsetY = e.clientY - posY;
  });

  document.addEventListener("mouseup", () => {
    if (!isHeld) return;
    isHeld = false;
    frogEl.style.cursor = "grab";
  });

  function getDirectionName(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -22.5 && angle < 22.5) return "E";
    if (angle >= 22.5 && angle < 67.5) return "SE";
    if (angle >= 67.5 && angle < 112.5) return "S";
    if (angle >= 112.5 && angle < 157.5) return "SW";
    if (angle >= 157.5 || angle < -157.5) return "W";
    if (angle >= -157.5 && angle < -112.5) return "NW";
    if (angle >= -112.5 && angle < -67.5) return "N";
    return "NE";
  }

  const horizontalFlipMap = {
    N: "N", S: "S",
    E: "W", W: "E",
    NE: "NW", NW: "NE",
    SE: "SW", SW: "SE",
  };

  function loop(timestamp) {
    if (timestamp - lastTime > 120) {
      lastTime = timestamp;
      frame++;

      const flapFrame = frame % 2;
      flyEl.style.backgroundPosition = `0px -${flapFrame * flyFrameH}px`;

      if (timestamp - lastFlyTargetTime > 3000) {
        lastFlyTargetTime = timestamp;
        pickNewFlyTarget();
      }

      const currentFlyX = parseFloat(flyEl.style.left) || flyTargetX;
      const currentFlyY = parseFloat(flyEl.style.top) || flyTargetY;
      const flyDx = flyTargetX - currentFlyX;
      const flyDy = flyTargetY - currentFlyY;
      const flyDist = Math.sqrt(flyDx * flyDx + flyDy * flyDy);

      if (flyDist > 2) {
        const flySpeed = 4;
        const nextFlyX = currentFlyX + (flyDx / flyDist) * flySpeed;
        const nextFlyY = currentFlyY + (flyDy / flyDist) * flySpeed;

        if (!isInsideBox(nextFlyX, nextFlyY, 20)) {
          flyEl.style.left = `${nextFlyX}px`;
          flyEl.style.top = `${nextFlyY}px`;
        } else {
          pickNewFlyTarget();
        }
      }

      // --- death pixel / judging detection (edge-triggered) ---
      const currentDeathState = window.deathPixel ? window.deathPixel.textContent : "alive";
      if (currentDeathState === "dead" && lastDeathState === "alive") {
        judging = true;
        judgingFrameCount = 0;
        lastJudgingTick = timestamp;
      }
      lastDeathState = currentDeathState;

      if (judging) {
        if (timestamp - lastJudgingTick > judgingSpeed) {
          lastJudgingTick = timestamp;
          judgingFrameCount++;
        }
        if (judgingFrameCount >= judgingFrames * 3) {
          judging = false;
        } else {
          const jf = judgingFrameCount % judgingFrames;
          frogEl.style.backgroundImage = `url('${judgeSheet}')`;
          frogEl.style.backgroundPosition = `-${jf * frameW}px 0px`;
          requestAnimationFrame(loop);
          return;
        }
      }

      // --- fly touch / croak detection (using shrunk hitboxes) ---
      const frogRect = getShrunkRect(frogEl, 0.3);
      const flyRect = getShrunkRect(flyEl, 0.3);
      const touching = !(
        frogRect.right < flyRect.left ||
        frogRect.left > flyRect.right ||
        frogRect.bottom < flyRect.top ||
        frogRect.top > flyRect.bottom
      );

      if (touching && frozenUntil === 0) {
        frozenUntil = Infinity;
        croakFrameCount = 0;
        lastCroakTick = timestamp;
      }

      if (frozenUntil === Infinity) {
        if (timestamp - lastCroakTick > croakSpeed) {
          lastCroakTick = timestamp;
          croakFrameCount++;
        }

        const totalFramesFor3Rotations = croakRows.length * 3;
        if (croakFrameCount >= totalFramesFor3Rotations) {
          frozenUntil = 0;
        } else {
          const actualRow = croakRows[croakFrameCount % croakRows.length];
          frogEl.style.backgroundImage = `url('${clownSheet}')`;
          frogEl.style.backgroundPosition = `0px -${actualRow * frameH}px`;
          requestAnimationFrame(loop);
          return;
        }
      }

      // --- normal chase / idle / hurt ---
      if (!isHeld) {
        const dx = mouseX - posX;
        const dy = mouseY - posY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseOverBox = isInsideBox(mouseX, mouseY);
        const moving = dist > 28 && !mouseOverBox;

        const dirName = getDirectionName(dx || 1, dy || 0);
        const idleRow = directionRows.indexOf(dirName);
        const jumpRow = directionRows.indexOf(horizontalFlipMap[dirName]);

        if (moving) {
          const speed = 12.5;
          let nextX = posX + (dx / dist) * speed;
          let nextY = posY + (dy / dist) * speed;

          if (isInsideBox(nextX, nextY, 50)) {
            const rect = boxEl.getBoundingClientRect();
            const insideVertically = posY > rect.top - 50 && posY < rect.bottom + 50;

            if (insideVertically) {
              const distToTop = Math.abs(posY - (rect.top - 50));
              const distToBottom = Math.abs(posY - (rect.bottom + 50));
              const vertDir = distToTop < distToBottom ? -1 : 1;
              posY += vertDir * speed;

              const sideStep = dx > 0 ? speed : -speed;
              if (!isInsideBox(posX + sideStep, posY, 50)) {
                posX += sideStep;
              }
            } else {
              posX = nextX;
              posY = nextY;
            }
          } else {
            posX = nextX;
            posY = nextY;
          }

          const f = frame % jumpFrames;
          frogEl.style.backgroundImage = `url('${currentCostume.jump}')`;
          frogEl.style.backgroundPosition = `-${f * frameW}px -${jumpRow * frameH}px`;
        } else {
          const f = frame % idleFrames;
          frogEl.style.backgroundImage = `url('${currentCostume.idle}')`;
          frogEl.style.backgroundPosition = `-${f * frameW}px -${idleRow * frameH}px`;
        }

        frogEl.style.left = `${posX - (frameW * scale) / 2}px`;
        frogEl.style.top = `${posY - (frameH * scale) / 2}px`;
      } else {
        frogEl.style.backgroundImage = `url('${currentCostume.hurt}')`;
        frogEl.style.backgroundPosition = `0px 0px`;
      }
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();