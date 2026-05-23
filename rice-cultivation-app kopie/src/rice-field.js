/* import grains from "./assets/rice-grains.json"; */
import { db } from "./storage";
import { loadRice, addGrain } from "./storage";

let RICE_POSITIONS;
const CELL_SIZE = 40; // distance between rice
const OFFSET = 10;    // the checkerboard shift
const world = document.getElementById("world");

const riceStages = [
  { maxDay: 31, img: "/rice/rice1-2.svg" },
  { maxDay: 60, img: "/rice/rice1-2.svg" },
  { maxDay: 92, img: "/rice/rice1-1.svg" },
  { maxDay: 122, img: "/rice/rice1-2.svg" },
  { maxDay: 163, img: "/rice/rice1-1.svg" },
  { maxDay: 183, img: "/rice/rice1-1.svg" }
];

init();

function init(){
  renderRice()
}

async function renderRice(){
  const { occupied, riceList } = await loadRice();
  console.log("hello",riceList)
  RICE_POSITIONS = occupied;
  console.log(RICE_POSITIONS)
  
    riceList.forEach((grain) => { 
      const el = document.createElement("img");
      const {x, y} = getPosition(grain.row,grain.col)
      console.log(x,y)
      const img = getImg(grain.createdAt)
      console.log(img)


      el.classList.add("rice");
      el.id = `${grain.row}-${grain.col}`
      el.src = img;
      
      el.style.position = "absolute";
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.addEventListener("click",()=>{
        console.log(grain.name)
      })  
      world.appendChild(el);
  });
}
//PLANTING NEW SEED
const plantSeedButton = document.getElementById("plant-seed-btn")

plantSeedButton.addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;
// GET CURRENT DATE FORMATEED
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0"); // months start at 0
  const year = now.getFullYear();

  const formattedDate = `${year}-${month}-${day}`;

console.log(formattedDate);
  const { row, col } = getRandomFreeCell(RICE_POSITIONS);
  if (!name || !email) return;
  await addGrain({
    row,
    col,
    name,
    email,
    contributors: [],
    state: "planted",
    createdAt: formattedDate,
    date: new Date()
  });

});




const plantButtons = document.querySelectorAll(".plant-btn")
console.log(plantButtons)

const plantContainer = document.getElementById("plant-container")

plantButtons.forEach((btn)=>{
  btn.addEventListener("click",()=>{
    plantContainer.classList.add("visible")
  })
})

function getPosition(row, col) {
  let x = col * CELL_SIZE;
  let y = row * CELL_SIZE;

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
  const currentDate = Date.now();

  const diffMs = currentDate - startTimestamp;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  console.log("diff days:", diffDays);

  for (let stage of riceStages) {
    if (diffDays < stage.maxDay) {
      return stage.img;
    }
  }

  // fallback (after full growth)
  return riceStages[riceStages.length - 1].img;
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