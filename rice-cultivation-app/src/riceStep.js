import riceSteps from './assets/rice-steps.json';
import { createARScanner } from './utils';
import startAnimation, { createTimelineRunner, stopAllAnimations } from './animations';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const arBtn = document.getElementById("ar-btn");
const backBtn = document.getElementById("back-btn");
const panel = document.getElementById("ar-panel");

let arSystem;
let currentTarget;
let arActive = false;

const data = riceSteps.find((item) => item.id == Number(id));
const sceneEl = document.querySelector("a-scene");

const timeline = createTimelineRunner();

sceneEl.setAttribute("mindar-image", "autoStart: false");

sceneEl.addEventListener("renderstart", () => {
  arSystem = sceneEl.systems["mindar-image-system"];
});

/* ---------------- INIT ---------------- */
function init() {
  setScene(data);
}
init();

/* ---------------- SCANNER ---------------- */
createARScanner(riceSteps, sceneEl, (id) => {
  if (!arActive) return;
  if (currentTarget === id) return;

  currentTarget = id;

  const step = riceSteps.find(i => i.id === id);
  if (!step) return;

  setScene(step);

  panel.classList.remove("open");
  arActive = false;

  timeline.stop();
  arSystem?.stop();
});

/* ---------------- SCENE ---------------- */
function setScene(step) {
  stopAllAnimations();
  document.querySelector("#title").textContent = step.title;
  document.querySelector("#description").textContent = step.description;
  document.querySelector("#number").textContent = +step.id + 1;
  document.querySelector("#days").textContent = step.days;

  const conditionsDiv = document.querySelector("#conditions");
  conditionsDiv.innerHTML = "";
  step.conditions.forEach((c) => {
    const p = document.createElement("p");
    p.textContent = c;
    conditionsDiv.appendChild(p);
  });

  const imagedDiv = document.querySelector(".images");
  imagedDiv.innerHTML = "";

  step.images.forEach(imgData => {
    const img = document.createElement("img");

    img.src = `/layer${step.id}-img/${imgData.src}`;
    img.classList.add("img", "object");

    Object.assign(img.style, {
      position: "absolute",
      ...imgData.style
    });

    imagedDiv.appendChild(img);
  });

  const objects = document.querySelectorAll(".object");

  startAnimation(objects);

  /* 🔥 THIS IS THE MISSING PART (your main bug) */
  if (step.animation) {
    console.log("animation exists")
    timeline.run(step.animation, document.querySelector(".images"), step.id);
  }
}

/* ---------------- AR BUTTON ---------------- */
arBtn.addEventListener("click", () => {
  arActive = true;

  arSystem?.start();

  setTimeout(() => {
    panel.classList.add("open");
  }, 300);
});

/* ---------------- BACK ---------------- */
backBtn.addEventListener("click", () => {
  panel.classList.remove("open");

  arActive = false;

  timeline.stop();
  arSystem?.stop();
});