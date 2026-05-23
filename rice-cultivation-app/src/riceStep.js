import riceSteps from './assets/rice-steps.json';
import { createARScanner } from './utils';

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

console.log("id:", id);

const data = riceSteps.find((item) => item.id == Number(id));

console.log("found item:", data);
function init(){
    document.querySelector("#title").textContent = data.title;
    document.querySelector("#description").textContent = data.description;  
    
}

document.getElementById()
init()

const scanner = createARScanner(steps, sceneEl, (id) => {

  if (navigating) return;
  if (currentTarget === id) return;

  currentTarget = id;
  navigating = true;

  // small delay prevents double-fire glitches
  setTimeout(() => {
    window.location.href = `/info.html?id=${id}`;
  }, 100);
});