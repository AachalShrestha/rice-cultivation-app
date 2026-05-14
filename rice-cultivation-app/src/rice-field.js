import grains from "./assets/rice-grains.json";

init();

function init(){

const world = document.getElementById("world");

    grains.forEach((grain) => {
    const el = document.createElement("img");

    el.classList.add("rice");
    el.src = grain.img;

    el.style.position = "absolute";
    el.style.left = grain.position.x + "px";
    el.style.top = grain.position.y + "px";

    world.appendChild(el);
    });
}


let isDragging = false;
let startX, startY;
let offsetX = 0, offsetY = 0;

world.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX - offsetX;
  startY = e.clientY - offsetY;
  world.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  world.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  offsetX = e.clientX - startX;
  offsetY = e.clientY - startY;

  world.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
});