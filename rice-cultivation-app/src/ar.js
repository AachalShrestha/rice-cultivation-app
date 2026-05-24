import { layer2 } from './scenes/layer-2.js';
import { layer1 } from './scenes/layer-1.js';
import { layer3 } from './scenes/layer-3.js';
import riceSteps from './assets/rice-steps.json'
import { createARScanner } from './utils.js';

import startAnimation from './animations.js';

const trackedRoot = document.querySelector('#tracked-root');

const t0 = document.querySelector("#target0");
const t1 = document.querySelector("#target1");
const layer01 = layer1(t0);
const layer02 = layer2(t1);
let currentTarget;
let currentScene = null;
let switching = false;

let activeScene = null;
const sceneEl = document.querySelector("a-scene");

console.log("start")

const scanner = createARScanner(riceSteps, sceneEl, (id) => {

  if (navigating) return;
  if (currentTarget === id) return;

  currentTarget = id;
  navigating = true;

  // small delay prevents double-fire glitches
  setTimeout(() => {
    window.location.href = `/info.html?id=${id}`;
  }, 100);
});


/* riceSteps.forEach((target) => {
  const entity = document.createElement("a-entity");

  entity.setAttribute("mindar-image-target", `targetIndex: ${target.id}`);
  entity.setAttribute("id", `target${target.id}`);

  sceneEl.appendChild(entity);

  // attach event
  entity.addEventListener("targetFound", () => {
    console.log("target found", )
    handleTarget(target);
  });
});


function handleTarget(target){
  if (currentTarget === target.id) return;

  currentTarget = target.id;

  window.location = `/info.html?id=${target.id}`;
} */
/* window.addEventListener("DOMContentLoaded", () => {
  

  console.log("start")
  t0.addEventListener("targetFound", () => {
    console.log("target1")
    layer01.start();
    const objects = document.querySelectorAll('.object');
    window.location = "/rice";
  });

  t1.addEventListener("targetFound", () => {
    console.log("target2")
    
    const objects = document.querySelectorAll('.object');
    window.location = "/info/:id";
    
  });
}); */


