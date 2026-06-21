function makeBoxDraggable(boxId) {
  const box = document.getElementById(boxId);
  if (!box) {
    console.error(`Drag setup failed: no element with id="${boxId}"`);
    return;
  }
  const titleBar = box.querySelector(".title-bar");
  if (!titleBar) {
    console.error(`Drag setup failed: no .title-bar inside #${boxId}`);
    return;
  }

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    e.preventDefault();
    isDragging = true;
    box.style.zIndex = "20";

    const rect = box.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    box.style.position = "absolute";
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
    box.style.transform = "none";
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    box.style.left = `${e.clientX - offsetX}px`;
    box.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

makeBoxDraggable("game-box");
makeBoxDraggable("context-box");