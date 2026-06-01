/* import grains from "./assets/rice-grains.json"; */
import { doc } from "firebase/firestore";
import { db } from "./storage";
import { loadRice, addGrain, checkEmail, plantSeed } from "./storage";

let RICE_POSITIONS;
const CELL_SIZE = 70; // distance between rice
const OFFSET = 10;    // the checkerboard shift
const world = document.getElementById("world");
let camera = {
  x: 0,
  y: 0,
  scale: 0.6
};

let GRAIN_AMOUNT = 0;

const riceStages = [
  { maxDay: 31, img: "/rice/SVG/rice1.svg", scale: 0.3 },
  { maxDay: 60, img: "/rice/SVG/rice2.svg", scale: 0.5 },
  { maxDay: 92, img: "/rice/SVG/rice3.svg", scale: 0.7 },
  { maxDay: 122, img: "/rice/SVG/rice4.svg", scale: 0.9 },
  { maxDay: 163, img: "/rice/SVG/rice5.svg", scale: 1 },
  { maxDay: 183, img: "/rice/SVG/rice6.svg", scale: 1.2 }
];

  const popup = document.createElement("div");
  popup.classList.add("rice-popup");
  world.appendChild(popup);
  let activeGrain = null;

init();
updateCamera();


function init(){
  renderRice()
}


const rendered = new Set();

async function renderRice() {
  const { occupied, riceList } = await loadRice();

  RICE_POSITIONS = occupied;
  console.log(occupied)
  riceList.forEach((grain) => {
    const key = `${grain.row}-${grain.col}`;

    const el = document.createElement("img");

    const { x, y } = getPosition(grain.row, grain.col);
    const { img, scale } = getImg(grain.createdAt);

    el.classList.add("rice");
    el.id = key;
    el.src = img;

    el.style.position = "absolute";
    el.style.left = x + "px";
    el.style.top = y + "px";

    // 🌱 start small for animation
    el.style.transform = "scale(0)";
    el.style.transition = "transform 0.6s ease-out";

    world.appendChild(el);

    // 🌱 grow only NEW rice
    if (!rendered.has(key)) {
      requestAnimationFrame(() => {
        el.style.transform = `scale(${scale})`;
      });
    } else {
      el.style.transform = `scale(${scale})`;
    }

    rendered.add(key);

    // CLICK POPUP
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
          <button class="rice-btn info-patch patch1">
            Planted by <span class="grain-name">${grain.name}</span>
            <svg class="button-curve" viewBox="0 0 40 80">
              <path d="M10 0 Q40 40 10 80" />
            </svg>
          </button>

          <button class="rice-btn info-patch patch2">
            ${days} days growing
            <svg class="button-curve" viewBox="0 0 40 80">
              <path d="M10 0 Q40 40 10 80" />
            </svg>
          </button>

        </div>
      `;

      popup.style.left = x - 10 + "px";
      popup.style.top = y - 40 + "px";

      showPopup();
    });
    el.addEventListener("mouseleave",()=>{
      hidePopup();
    })

    world.appendChild(el);
  });
}
/////////// SIDE PANEL SHOW HIDE //////////
const plantButton = document.getElementById("plant-btn")
const plantContainerCross = document.getElementById("plant-container-cross")

const plantContainer = document.getElementById("plant-container")
plantButton.addEventListener("click", () => {
  console.log("plantbtn vlicked")
  plantContainer.classList.add("visible");
});
plantContainerCross.addEventListener("click", (e) => {
    plantContainer.classList.remove("visible");
    document.getElementById("nameInput").value = "";
     document.getElementById("emailInput").value = "";
  document.getElementById("message").style.color ="white";

});



//////////////PLANTING NEW SEED////////
const plantSeedButton = document.getElementById("plant-seed-btn")

plantSeedButton.addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
// GET CURRENT DATE FORMATEED
  const now = new Date();
  const date = now.toISOString().split("T")[0]; // "2026-05-30"
  const messageDiv = document.getElementById("message")
  console.log(date)

  const exists = await checkEmail(email);

  if (exists) {
    messageDiv.style.color ="red"
    messageDiv.innerHTML = "You already planted rice!"
    return;
  }

  const { row, col } = getRandomFreeCell(RICE_POSITIONS);
  if (!name || !email) {
    messageDiv.style.color ="red"
    messageDiv.innerHTML = "Please fill in all the fields"
    return;
  }
    messageDiv.style.color ="black"
    messageDiv.classList.add("white")
    messageDiv.innerHTML = "Planting seed..."
    await addGrain({
      row,
      col,
      name,
      email,
      contributors: [],
      state: "planted",
      createdAt: date,
    });
    await plantSeed(email, name)
    console.log("seed planted", name, email)
     messageDiv.style.color ="white"
    renderRice()
    name.value = "";
    email.value = ""
    messageDiv.value = ""
});










function getPosition(row, col) {
  let x = col * CELL_SIZE;
  let y = row * (CELL_SIZE*1.1);

  // ✨ checkerboard offset
  if (row % 2 === 0) {
    x += OFFSET;
  }

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
  const startDate = new Date(startTimestamp); // ✅ convert string → Date
  const diff = getDaysDifference(startDate, now)
  let img;
  let scale;

  console.log("diff days:", diff);

  for (let stage of riceStages) {
    if (diff < stage.maxDay) {
      img = stage.img
      scale = stage.scale
      return { img, scale };
      
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




//DRAGGING SCREEN
let isDragging = false;
let startX = 0;
let startY = 0;

window.addEventListener("mousedown", (e) => {
  isDragging = true;

  startX = e.clientX - camera.x;
  startY = e.clientY - camera.y;

  world.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
  isDragging = false;
  world.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
  if (!isDragging) return;

  camera.x = e.clientX - startX;
  camera.y = e.clientY - startY;

  updateCamera();
});

window.addEventListener("wheel", (e) => {
  e.preventDefault();

  const zoomIntensity = 0.001;
  const scaleChange = 1 - e.deltaY * zoomIntensity;

  const newScale = Math.min(Math.max(camera.scale * scaleChange, 0.3), 3);

  // mouse position
  const mouseX = e.clientX;
  const mouseY = e.clientY;

  // world position before zoom
  const worldX = (mouseX - camera.x) / camera.scale;
  const worldY = (mouseY - camera.y) / camera.scale;

  camera.scale = newScale;

  // adjust camera so zoom happens at cursor
  camera.x = mouseX - worldX * camera.scale;
  camera.y = mouseY - worldY * camera.scale;

  updateCamera();
}, { passive: false });

function updateCamera() {
  world.style.transform = `
    translate(${camera.x}px, ${camera.y}px)
    scale(${camera.scale})
  `;
}


// POPUP
function showPopup() {
  popup.classList.add("show");
}

function hidePopup() {
  popup.classList.remove("show");
  activeGrain = null;
}
document.addEventListener("click", () => {
  hidePopup();
});
