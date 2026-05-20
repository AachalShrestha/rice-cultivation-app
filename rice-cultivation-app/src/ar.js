import { layer2 } from './scenes/layer-2.js';
import { layer1 } from './scenes/layer-1.js';
import { layer3 } from './scenes/layer-3.js';

import startAnimation from './animations.js';

const trackedRoot = document.querySelector('#tracked-root');

let currentScene = null;

async function loadScene(sceneFn) {
  // destroy previous scene safely
  if(currentScene == sceneFn) return;
  if (currentScene?.destroy) {
    currentScene.destroy();
  }

  // load new scene


  currentScene = await sceneFn(trackedRoot);
  console.log(currentScene,"yoyoy", sceneFn)
}

async function initScene() {
  const tracker = document.getElementById('tracked-root');

  await loadScene(layer1);

  tracker.addEventListener("targetFound", () => {
    const objects = document.querySelectorAll('.object');
    startAnimation(objects);
  });
}

initScene();

window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("scene1Btn")?.addEventListener("click", () => {
    loadScene(layer1);

  });

  document.getElementById("scene2Btn")?.addEventListener("click", () => {
    loadScene(layer2);
  });

  document.getElementById("scene3Btn")?.addEventListener("click", () => {
    loadScene(layer3);
  });
});

const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("active");
  navMenu.classList.toggle("show");
});