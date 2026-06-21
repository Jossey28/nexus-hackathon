// oneko.js: https://github.com/adryd325/oneko.js

(function frogFollow() {
  const frogEl = document.createElement("div");
  const frameW = 32;
  const frameH = 32;
  const scale = 3;
  const idleFrames = 5;
  const jumpFrames = 8;
  const directionRows = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];
  const boxEl = document.querySelector(".box");

  const clownSheet = "/sprites/frog-fly.png";
  const croakRows = [0, 1, 2]; // replace with the actual row numbers (0-5) containing your croak frames

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
  const croakSpeed = 300; // ms per croak frame, higher = slower

  frogEl.style.position = "fixed";
  frogEl.style.width = `${frameW}px`;
  frogEl.style.height = `${frameH}px`;
  frogEl.style.transform = `scale(${scale})`;
  frogEl.style.transformOrigin = "top left";
  frogEl.style.imageRendering = "pixelated";
  frogEl.style.zIndex = "1";
  frogEl.style.cursor = "grab";
  document.body.appendChild(frogEl);

  const flyEl = document.createElement("div");
  const flyFrameW = 32;
  const flyFrameH = 32;
  const flyScale = 1.5;
  flyEl.style.position = "fixed";
  flyEl.style.width = `${flyFrameW}px`;
  flyEl.style.height = `${flyFrameH}px`;
  flyEl.style.backgroundImage = "url('/sprites/fly.png')";
  flyEl.style.transform = `scale(${flyScale})`;
  flyEl.style.transformOrigin = "top left";
  flyEl.style.zIndex = "1";
  flyEl.style.imageRendering = "pixelated";
  flyEl.style.left = "200px";
  flyEl.style.top = "200px";
  document.body.appendChild(flyEl);

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

  function loop(timestamp) {
    if (timestamp - lastTime > 120) {
      lastTime = timestamp;
      frame++;

      const flapFrame = frame % 2;
      flyEl.style.backgroundPosition = `0px -${flapFrame * flyFrameH}px`;

      const time = timestamp / 1000;
     const candidateX = window.innerWidth * 0.15 + Math.sin(time * 0.5) * 100;
     const candidateY = window.innerHeight * 0.15 + Math.cos(time * 0.7) * 100;

      if (!isInsideBox(candidateX, candidateY, 20)) {
        flyEl.style.left = `${candidateX}px`;
        flyEl.style.top = `${candidateY}px`;
      }

      const frogRect = frogEl.getBoundingClientRect();
      const flyRect = flyEl.getBoundingClientRect();
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
          const speed = 11;
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
      } else {
        frogEl.style.backgroundImage = `url('${currentCostume.hurt}')`;
        frogEl.style.backgroundPosition = `0px 0px`;
      }
    }
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();