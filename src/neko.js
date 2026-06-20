// oneko.js: https://github.com/adryd325/oneko.js

(function frogFollow() {
  const frogEl = document.createElement("div");
  const frameW = 32;
  const frameH = 32;
  const scale = 2;
  const idleFrames = 5;
  const jumpFrames = 8;
  const directionRows = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];
  const boxEl = document.querySelector(".box");
  const canvasEl = document.getElementById("kaplay-game");

  const costumes = [
    { idle: "/sprites/frog-idle.png", jump: "/sprites/frog-jump.png" },
  ];
  let currentCostume = costumes[0];

  let posX = 100, posY = 100;
  let mouseX = 0, mouseY = 0;
  let frame = 0;
  let lastTime = 0;

  let state = "normal"; // normal, judging, frozen
  let stateUntil = 0;

  let isHeld = false;
  let holdOffsetX = 0, holdOffsetY = 0;

  frogEl.style.position = "fixed";
  frogEl.style.width = `${frameW}px`;
  frogEl.style.height = `${frameH}px`;
  frogEl.style.transform = `scale(${scale})`;
  frogEl.style.transformOrigin = "top left";
  frogEl.style.imageRendering = "pixelated";
  frogEl.style.zIndex = "1";
  frogEl.style.cursor = "grab";
  document.body.appendChild(frogEl);


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
    isHeld = true;
    frogEl.style.cursor = "grabbing";
    holdOffsetX = e.clientX - posX;
    holdOffsetY = e.clientY - posY;
  });

  document.addEventListener("mouseup", () => {
    if (!isHeld) return;
    isHeld = false;
    frogEl.style.cursor = "grab";
    checkFlyCollision();
  });

  // --- fly, random spawn ---
  const flyEl = document.createElement("img");
  flyEl.src = "/sprites/fly.png";
  flyEl.style.position = "fixed";
  flyEl.style.width = "24px";
  flyEl.style.height = "24px";
  flyEl.style.zIndex = "1";
  flyEl.style.imageRendering = "pixelated";
  document.body.appendChild(flyEl);

  function respawnFly() {
    const x = Math.random() * (window.innerWidth - 40) + 10;
    const y = Math.random() * (window.innerHeight - 40) + 10;
    flyEl.style.left = `${x}px`;
    flyEl.style.top = `${y}px`;
  }
  respawnFly();

  function checkFlyCollision() {
    const frogRect = frogEl.getBoundingClientRect();
    const flyRect = flyEl.getBoundingClientRect();
    const overlap = !(
      frogRect.right < flyRect.left ||
      frogRect.left > flyRect.right ||
      frogRect.bottom < flyRect.top ||
      frogRect.top > flyRect.bottom
    );

    if (overlap) {
      state = "frozen";
      stateUntil = performance.now() + 5000;
      currentCostume = costumes[Math.floor(Math.random() * costumes.length)];
      flyEl.style.display = "none";
    }
  }


  // --- direction math, idle raw / jump offset by 4 ---
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

  // --- collision against the game box ---
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

function checkDeathPixel() {
  return window.deathPixel && window.deathPixel.textContent === "dead";
}

function loop(timestamp) {
  if (timestamp - lastTime > 120) {
    lastTime = timestamp;
    frame++;

    if ((state === "judging" || state === "frozen") && performance.now() > stateUntil) {
      state = "normal";
      currentCostume = costumes[0];
      if (flyEl.style.display === "none") respawnFly();
      flyEl.style.display = "block";
    }

    if (state === "normal" && !isHeld && checkDeathPixel()) {
      state = "judging";
      stateUntil = performance.now() + 5000;
    }

    if (!isHeld) {
      if (state === "judging") {
        frogEl.style.backgroundImage = `url('${currentCostume.idle}')`;
        frogEl.style.backgroundPosition = `0px 0px`;
      } else if (state === "frozen") {
        const f = frame % idleFrames;
        frogEl.style.backgroundImage = `url('${currentCostume.idle}')`;
        frogEl.style.backgroundPosition = `-${f * frameW}px 0px`;
      } else {
        const dx = mouseX - posX;
        const dy = mouseY - posY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const mouseOverBox = isInsideBox(mouseX, mouseY);
        const moving = dist > 28 && !mouseOverBox;

        const dirName = getDirectionName(dx || 1, dy || 0);
        const idleRow = directionRows.indexOf(dirName);
        const jumpRow = directionRows.indexOf(horizontalFlipMap[dirName]);

        if (moving) {
          const speed = 10;
          let nextX = posX + (dx / dist) * speed;
          let nextY = posY + (dy / dist) * speed;

          if (isInsideBox(nextX, nextY, 20)) {
            const rect = boxEl.getBoundingClientRect();
            const insideVertically = posY > rect.top - 20 && posY < rect.bottom + 20;

            if (insideVertically) {
              const distToTop = Math.abs(posY - (rect.top - 20));
              const distToBottom = Math.abs(posY - (rect.bottom + 20));
              const vertDir = distToTop < distToBottom ? -1 : 1;
              posY += vertDir * speed;

              const sideStep = dx > 0 ? speed : -speed;
              if (!isInsideBox(posX + sideStep, posY, 20)) {
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
      }
    }
  }
  requestAnimationFrame(loop);
}

  requestAnimationFrame(loop);
})();