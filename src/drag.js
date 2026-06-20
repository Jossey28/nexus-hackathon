(function makeDraggable() {
  const box = document.querySelector(".box");
  const titleBar = document.querySelector(".title-bar");

  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;

  titleBar.addEventListener("mousedown", (e) => {
    isDragging = true;

    const rect = box.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    box.style.transform = "none";
    box.style.left = `${rect.left}px`;
    box.style.top = `${rect.top}px`;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    box.style.left = `${e.clientX - offsetX}px`;
    box.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });
})();