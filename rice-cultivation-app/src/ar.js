import { layer2 } from './scenes/layer-2.js';
import { layer1 } from './scenes/layer-1.js';
import { layer3 } from './scenes/layer-3.js';

import startAnimation from './animations.js';

const trackedRoot = document.querySelector('#tracked-root');

const t0 = document.querySelector("#target0");
const t1 = document.querySelector("#target1");
const layer01 = layer1(t0);
const layer02 = layer2(t1);

let currentScene = null;
let switching = false;

let activeScene = null;

/* function activate(scene) {

  if (activeScene === scene) return;

  // stop previous
  activeScene?.stop?.();

  // start new
  activeScene = scene;
  activeScene.start?.();
} */
console.log("start")
window.addEventListener("DOMContentLoaded", () => {
  

  console.log("start")
  t0.addEventListener("targetFound", () => {
    console.log("target1")
    layer01.start();
    const objects = document.querySelectorAll('.object');
    startAnimation(objects);
  });

  t1.addEventListener("targetFound", () => {
    console.log("target2")
    
    const objects = document.querySelectorAll('.object');
    startAnimation(objects);
    layer02.start();
  });
});





const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("show");
});