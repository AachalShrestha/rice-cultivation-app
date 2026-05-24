import riceSteps from './assets/rice-steps.json';
import { createARScanner } from './utils';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const arBtn = document.getElementById("ar-btn");
const backBtn = document.getElementById("back-btn");
const panel = document.getElementById("ar-panel");

let arSystem;
let currentTarget;
let arActive = false;

console.log("id:", id);

const data = riceSteps.find((item) => item.id == Number(id));
const sceneEl = document.querySelector("a-scene");

console.log(sceneEl);

// ✅ IMPORTANT: set this BEFORE AR initializes (optional but safe)
sceneEl.setAttribute("mindar-image", "autoStart: false");

// GET AR system safely
sceneEl.addEventListener("renderstart", () => {
  arSystem = sceneEl.systems["mindar-image-system"];

  // ❌ REMOVE this line (causes your crash)
  // arSystem.stop();
});

function init() {
  document.querySelector("#title").textContent = data.title;
  document.querySelector("#description").textContent = data.description;
}

init();

const scanner = createARScanner(riceSteps, sceneEl, (id) => {
  if (!arActive) return;              // keep this
  if (currentTarget === id) return;

  currentTarget = id;

  const step = riceSteps.find(i => i.id === id);
  if (!step) return;

  setScene(step);

  panel.classList.remove("open");

  arActive = false;

  if (arSystem) {
    setTimeout(() => {
      arSystem.stop();
    }, 500);
  }
});

function setScene(step) {
  document.querySelector("#title").textContent = step.title;
  document.querySelector("#description").textContent = step.description;
}

// ▶ OPEN AR
arBtn.addEventListener("click", () => {

  arActive = true;

  if (arSystem) {
    arSystem.start();

      setTimeout(() => {
      panel.classList.add("open");
   }, 500);
  }
});

// ◀ CLOSE AR
backBtn.addEventListener("click", () => {
  panel.classList.remove("open");

  arActive = false;

  if (arSystem) {
    arSystem.stop();
  }
});