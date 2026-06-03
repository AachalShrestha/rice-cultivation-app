/* import grains from "./assets/rice-grains.json"; */
import { doc } from "firebase/firestore";
import { db } from "./storage";
import {
  loadRice,
  addGrain,
  checkEmail,
  plantSeed,
} from "./storage";
import showTemporaryMessage from "./utils";
import gsap from "gsap";

/* --------------------------------------------------
   🌾 GLOBAL STATE
-------------------------------------------------- */

let RICE_POSITIONS;

const CELL_SIZE = 70;
const OFFSET = 10;

const world = document.getElementById("world");

let initialDistance = null;
let isPinching = false;

let camera = {
  x: 300,
  y: 0,
  scale: 0.8,
};

let inactivityTimer;
const TIMEOUT = 60000;

let activeGrain = null;

/* --------------------------------------------------
   🌱 RICE STAGES
-------------------------------------------------- */

const riceStages = [
  { maxDay: 31, img: "/rice/SVG/rice1.svg", scale: 0.3 },
  { maxDay: 60, img: "/rice/SVG/rice2.svg", scale: 0.5 },
  { maxDay: 92, img: "/rice/SVG/rice3.svg", scale: 0.7 },
  { maxDay: 122, img: "/rice/SVG/rice4.svg", scale: 0.9 },
  { maxDay: 163, img: "/rice/SVG/rice5.svg", scale: 1 },
  { maxDay: 183, img: "/rice/SVG/rice6.svg", scale: 1.2 },
];

/* --------------------------------------------------
   💬 POPUP
-------------------------------------------------- */

const popup = document.createElement("div");
popup.classList.add("rice-popup");
world.appendChild(popup);

/* --------------------------------------------------
   🚀 INIT
-------------------------------------------------- */

init();
updateCamera();

function init() {
  renderRice();
}

/* --------------------------------------------------
   🌾 RENDER RICE FIELD
-------------------------------------------------- */

async function renderRice() {
  const { occupied, riceList } = await loadRice();

  RICE_POSITIONS = occupied;

  riceList.forEach((grain) => {
    const key = `${grain.row}-${grain.col}`;
    if (document.getElementById(key)) return;

    const el = document.createElement("img");
    el.classList.add("rice");
    el.id = key;
    el.src = getImg(grain.createdAt).img;

    const { x, y } = getPosition(grain.row, grain.col);
    const { scale } = getImg(grain.createdAt);

    el.style.position = "absolute";
    el.style.left = x + "px";
    el.style.top = y + "px";

    // 🌱 animation
    gsap.fromTo(
      el,
      { scale: 0, transformOrigin: "bottom center", y: 20 },
      {
        scale,
        y: 0,
        duration: 0.8,
        ease: "back.out(2.5)",
      }
    );

    /* -------------------------------
       🌾 POPUP ON HOVER
    -------------------------------- */

    el.addEventListener("mouseenter", (e) => {
      e.stopPropagation();

      const now = new Date();
      const startDate = new Date(grain.createdAt);
      const days = getDaysDifference(startDate, now);

      if (activeGrain === el) {
        hidePopup();
        return;
      }

      activeGrain = el;

      popup.innerHTML = `
        <div class="info-popup">
          <button class="info-patch patch1">
            Planted by <span class="grain-name">${grain.name}</span>
          </button>

          <button class="info-patch patch2">
            ${days} days growing
          </button>
        </div>
      `;

      popup.style.left = x - 50 + "px";
      popup.style.top = y + "px";

      showPopup();
    });

    el.addEventListener("mouseleave", hidePopup);

    world.appendChild(el);
  });
}

/* --------------------------------------------------
   🌱 PLANT UI
-------------------------------------------------- */

const plantButton = document.getElementById("plant-btn");
const plantContainer = document.getElementById("plant-container");
const plantContainerCross = document.getElementById("plant-container-cross");

plantButton.addEventListener("click", () => {
  plantContainer.classList.add("visible");
});

plantContainerCross.addEventListener("click", () => {
  plantContainer.classList.remove("visible");
  emptyInputs();
});

function emptyInputs() {
  document.getElementById("nameInput").value = "";
  document.getElementById("emailInput").value = "";
  document.getElementById("messageInput").value = "";
  document.getElementById("message").style.color = "white";
}

/* --------------------------------------------------
   🌱 PLANT SEED
-------------------------------------------------- */

const plantSeedButton = document.getElementById("plant-seed-btn");

plantSeedButton.addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
  const message = document.getElementById("messageInput").value;
  console.log(message)

  const now = new Date();
  const date = now.toISOString().split("T")[0];

  const messageDiv = document.getElementById("message");
  const confirmDiv = document.getElementById("confirm-message");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    messageDiv.style.color = "red";
    messageDiv.innerHTML = "Invalid email";
    return;
  }

  const exists = await checkEmail(email);
  if (exists) {
    messageDiv.style.color = "red";
    messageDiv.innerHTML = "You already planted rice!";
    return;
  }

  if (!name || !email) {
    messageDiv.style.color = "red";
    messageDiv.innerHTML = "Please fill in all the fields";
    return;
  }

  messageDiv.style.color = "black";
  messageDiv.innerHTML = "Planting seed...";

  const { row, col } = getRandomFreeCell(RICE_POSITIONS);

  await addGrain({
    row,
    col,
    name,
    message,
    email,
    contributors: [],
    state: "planted",
    createdAt: date,
  });

  await plantSeed(email, name, message);

  plantContainer.classList.remove("visible");

  showTemporaryMessage(confirmDiv, 3000);

  renderRice();
  emptyInputs();
});

/* --------------------------------------------------
   🌾 HELPERS
-------------------------------------------------- */


function getPosition(row, col) {
  let x = col * CELL_SIZE;
  let y = row * (CELL_SIZE * 1.1);

  if (row % 2 === 0) x += OFFSET;

  return { x, y };
}

function getRandomFreeCell(occupied, maxRows = 15, maxCols = 15) {
  const maxAttempts = 100;

  for (let i = 0; i < maxAttempts; i++) {
    const row = Math.floor(Math.random() * maxRows);
    const col = Math.floor(Math.random() * maxCols);

    const key = `${row}-${col}`;

    if (!occupied.has(key)) {
      return { row, col };
    }
  }

  throw new Error("No free cell found 🌾");
}

function getImg(startTimestamp) {
  const now = new Date();
  const startDate = new Date(startTimestamp);
  const diff = getDaysDifference(startDate, now);

  for (let stage of riceStages) {
    if (diff < stage.maxDay) {
      return { img: stage.img, scale: stage.scale };
    }
  }

  const last = riceStages[riceStages.length - 1];
  return { img: last.img, scale: last.scale };
}

function getDaysDifference(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/* --------------------------------------------------
   🖱️ DRAG + ZOOM
-------------------------------------------------- */

let isDragging = false;
let startX = 0;
let startY = 0;

/* TOUCH */
window.addEventListener("touchstart", (e) => {
  if (e.touches.length === 1) {
    // 👉 DRAG
    isDragging = true;
    isPinching = false;

    const t = e.touches[0];
    startX = t.clientX - camera.x;
    startY = t.clientY - camera.y;

  } else if (e.touches.length === 2) {
    // 👉 PINCH START
    isPinching = true;
    isDragging = false;

    initialDistance = getDistance(e.touches);
  }
});

window.addEventListener("touchmove", (e) => {
  // 👉 PINCH ZOOM
  if (e.touches.length === 2 && isPinching) {
    e.preventDefault();

    const newDistance = getDistance(e.touches);
    const zoomFactor = newDistance / initialDistance;

    const newScale = Math.min(
      Math.max(camera.scale * zoomFactor, 0.3),
      3
    );

    // zoom toward center between fingers
    const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;

    const worldX = (midX - camera.x) / camera.scale;
    const worldY = (midY - camera.y) / camera.scale;

    camera.scale = newScale;

    camera.x = midX - worldX * camera.scale;
    camera.y = midY - worldY * camera.scale;

    initialDistance = newDistance;

    updateCamera();
    return;
  }

  // 👉 DRAG
  if (!isDragging || e.touches.length !== 1) return;

  const t = e.touches[0];
  camera.x = t.clientX - startX;
  camera.y = t.clientY - startY;

  updateCamera();
});

window.addEventListener("touchend", () => {
  isDragging = false;
  isPinching = false;
  initialDistance = null;
});

function getDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
/* MOUSE */
window.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX - camera.x;
  startY = e.clientY - camera.y;

  world.style.cursor = "grabbing";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  camera.x = e.clientX - startX;
  camera.y = e.clientY - startY;

  updateCamera();
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  world.style.cursor = "grab";
});

/* WHEEL ZOOM */
window.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();

    const zoomIntensity = 0.001;
    const scaleChange = 1 - e.deltaY * zoomIntensity;

    const newScale = Math.min(
      Math.max(camera.scale * scaleChange, 0.3),
      3
    );

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const worldX = (mouseX - camera.x) / camera.scale;
    const worldY = (mouseY - camera.y) / camera.scale;

    camera.scale = newScale;

    camera.x = mouseX - worldX * camera.scale;
    camera.y = mouseY - worldY * camera.scale;

    updateCamera();
  },
  { passive: false }
);

/* BUTTON ZOOM */
let targetScale = camera.scale;
let zooming = false;

const zoomIn = document.getElementById("zoom-in");
const zoomOut = document.getElementById("zoom-out");

zoomIn.addEventListener("click", () => {
  targetScale = Math.min(targetScale + 0.3, 3);
  startZoomAnimation();
});

zoomOut.addEventListener("click", () => {
  targetScale = Math.max(targetScale - 0.3, 0.3);
  startZoomAnimation();
});

function startZoomAnimation() {
  if (zooming) return;
  zooming = true;

  function animate() {
    camera.scale = lerp(camera.scale, targetScale, 0.15);
    updateCamera();

    if (Math.abs(camera.scale - targetScale) < 0.001) {
      camera.scale = targetScale;
      zooming = false;
      return;
    }

    requestAnimationFrame(animate);
  }

  animate();
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function updateCamera() {
  world.style.transform = `
    translate(${camera.x}px, ${camera.y}px)
    scale(${camera.scale})
  `;
}

/* --------------------------------------------------
   💬 POPUP CONTROL
-------------------------------------------------- */

function showPopup() {
  popup.classList.add("show");
}

function hidePopup() {
  popup.classList.remove("show");
  activeGrain = null;
}

document.addEventListener("click", hidePopup);

/* --------------------------------------------------
   ⏳ INACTIVITY RESET
-------------------------------------------------- */

function resetTimer() {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    window.location = "/scan.html";
  }, TIMEOUT);
}

["mousemove", "mousedown", "touchstart", "keydown", "scroll"].forEach(
  (event) => document.addEventListener(event, resetTimer)
);

resetTimer();

/* --------------------------------------------------
   🍔 HAMBURGER MENU
-------------------------------------------------- */

const hamburger = document.getElementById("hamburger");
const nav = document.getElementById("nav");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  nav.classList.toggle("open");
});