// oneko.js: https://github.com/adryd325/oneko.js

(function frogFollow() {
  const frogEl = document.createElement("div");
  const frameW = 32;
  const frameH = 32;
  const scale = 2; // bump up/down to resize
  const idleFrames = 3;
  const jumpFrames = 4;
  const directionRows = ["S", "SW", "W", "NW", "N", "NE", "E", "SE"];

  let posX = 100, posY = 100;
  let mouseX = 0, mouseY = 0;
  let frame = 0;
  let lastTime = 0;

  frogEl.style.position = "fixed";
  frogEl.style.width = `${frameW}px`;
  frogEl.style.height = `${frameH}px`;
  frogEl.style.transform = `scale(${scale})`;
  frogEl.style.transformOrigin = "top left";
  frogEl.style.imageRendering = "pixelated";
  frogEl.style.pointerEvents = "none";
  frogEl.style.zIndex = "9999";
  document.body.appendChild(frogEl);

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function getDirectionIndex(dx, dy) {
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle >= -22.5 && angle < 22.5) return directionRows.indexOf("E");
    if (angle >= 22.5 && angle < 67.5) return directionRows.indexOf("SE");
    if (angle >= 67.5 && angle < 112.5) return directionRows.indexOf("S");
    if (angle >= 112.5 && angle < 157.5) return directionRows.indexOf("SW");
    if (angle >= 157.5 || angle < -157.5) return directionRows.indexOf("W");
    if (angle >= -157.5 && angle < -112.5) return directionRows.indexOf("NW");
    if (angle >= -112.5 && angle < -67.5) return directionRows.indexOf("N");
    return directionRows.indexOf("NE");
  }

function loop(timestamp) {
  if (timestamp - lastTime > 120) {
    lastTime = timestamp;
    frame++;

    const dx = mouseX - posX;
    const dy = mouseY - posY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const moving = dist > 48;

    const rowIndex = (getDirectionIndex(dx || 1, dy || 0) + 4) % 8;

    if (moving) {
      const speed = 6;
      posX += (dx / dist) * speed;
      posY += (dy / dist) * speed;

      const f = frame % jumpFrames;
      frogEl.style.backgroundImage = "url('/sprites/frog-jump.png')";
      frogEl.style.backgroundPosition = `-${f * frameW}px -${rowIndex * frameH}px`;
    } else {
      const f = frame % idleFrames;
      frogEl.style.backgroundImage = "url('/sprites/frog-idle.png')";
      frogEl.style.backgroundPosition = `-${f * frameW}px -${rowIndex * frameH}px`;
    }

    frogEl.style.left = `${posX - (frameW * scale) / 2}px`;
    frogEl.style.top = `${posY - (frameH * scale) / 2}px`;
  }
  requestAnimationFrame(loop);
}

  requestAnimationFrame(loop);
})();