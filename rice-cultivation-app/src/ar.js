

import { layer2 } from './scenes/layer-2.js';

import './animations.js'; 

import startAnimation from './animations.js';

const trackedRoot = document.querySelector('#tracked-root');

/* const params = new URLSearchParams(window.location.search);
const id = params.get('id');  */
console.log("got here")

// Main function to fetch scene data and initialize AR
async function initScene() {
  try {

    //for now the scene witht the generated img and model are in scene2
    layer2(trackedRoot);

    //animate everytime the marker gets detected
    const tracker = document.getElementById('tracked-root');
    tracker.addEventListener("targetFound", () => {
        const objects = document.querySelectorAll('.object'); // query now
        console.log(objects); // now it will include your img and models
        startAnimation(objects);
    });
  } catch (err) {
    console.error("Error initializing scene:", err);
  }
}


/* // Fetch scene data from server
async function fetchSceneData(id) {
  const response = await fetch(`http://localhost:3000/scenes/${id}`);
  
  console.log("Response status:", response.status);

  const text = await response.text();
  console.log("Raw response text:", text);

  if (!text) {
    throw new Error("Empty response from server");
  }

  return JSON.parse(text);
} */


// Start everything
initScene();
