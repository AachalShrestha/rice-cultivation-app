import riceSteps from './assets/rice-steps.json';
import { createARScanner } from './utils';
import startAnimation, { createTimelineRunner, stopAllAnimations } from './animations';
import showTemporaryMessage from './utils';

import { doc } from 'firebase/firestore';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

const arBtn = document.getElementById("ar-btn");
const backBtn = document.getElementById("back-btn");
const panel = document.getElementById("ar-panel");

let AMOUNT_LAYERS_SCANNED = 0;

let inactivityTimer;
const TIMEOUT = 60000; // 1 min

let arSystem;
let currentTarget;
let arActive = false;

const data = riceSteps.find((item) => item.id == Number(id));
console.log(data)
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
  console.log("creating step")
  if (!arActive) return;
  if (currentTarget === id) return;
  const subtlePopup = document.getElementById("ricefield-popup")
  console.log("scanned ", id)
  currentTarget = id;

  const step = riceSteps.find(i => String(i.id) === String(id));
  
  if (!step) return;

  setScene(step);
  AMOUNT_LAYERS_SCANNED += 1;

  panel.classList.remove("open");
  arActive = false;

  timeline.stop();
  arSystem?.stop();
  if (AMOUNT_LAYERS_SCANNED % 3 === 0) {
  showTemporaryMessage(subtlePopup, 4000);
}
});

/* ---------------- SCENE ---------------- */
function setScene(step) {
  const isIntro = step.id == 0;
  const titleEl = document.querySelector("#title");
  const descEl = document.querySelector("#description");
  const numberEl = document.querySelector("#number");
  const daysEl = document.querySelector("#days");
  const copyEl = document.querySelector(".copy");
  const conditionsDiv = document.querySelector("#conditions");
  const imagesDiv = document.querySelector(".images");
  stopAllAnimations();
  console.log(step)
// -------------------
  // TEXT CONTENT
  // -------------------
  titleEl.textContent = step.title;
  descEl.textContent = step.description;

  numberEl.textContent = isIntro ? "" : step.id;
  daysEl.textContent = isIntro ? "" : step.days;

  // -------------------
  // LAYOUT STYLES
  // -------------------
  copyEl.style.left = isIntro ? "200px" : "40px";

  titleEl.style.fontSize = isIntro ? "90pt" : "56px";
  titleEl.style.marginBottom = isIntro ? "40px" : "20px";

  // -------------------
  // CONDITIONS
  // -------------------
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


//check mouse
function resetTimer() {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    window.location = "/scan.html";
  }, TIMEOUT);
}
// events that count as "activity"
["mousemove", "mousedown", "touchstart", "keydown", "scroll"].forEach(event => {
  document.addEventListener(event, resetTimer);
});

// start timer on load
resetTimer();