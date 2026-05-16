import gsap from "gsap";
import { createImage } from "../utils";

export function layer2(parentEl) {

  const planes = []; // ✅ now shared inside everything

  const imgPositions = [
    { x: 0, y: 0, z: 0.1 },
    { x: 0, y: 0, z: 0.3 },
    { x: 0, y: 0, z: 0.8 },
    { x: 0, y: 0, z: 0.4 },
  ];

  const animationFrames = {};

  const sequences = {
    3: "/layer2-img/png-sq-2",
    2: "/layer2-img/png-sq-3"
  };

  const assetsDiv = document.querySelector('a-assets');

  const imageStaticPaths = Array.from({ length: 4 }, (_, i) =>
    `/layer2-img/layer2_000${i}.png`
  );


async function loadImages() {

  const promises = [];

  // ✅ 1. static images
  imageStaticPaths.forEach((src, i) => {
    console.log("assetsDiv:", assetsDiv);
    promises.push(
      createImage(assetsDiv, `texture-${i}`, src)
    );
  });

  // ✅ 2. sequence images
  Object.entries(sequences).forEach(([key, folder]) => {

    const frameCount = key == 2 ? 7 : 5; // change to variable on how many images

    animationFrames[key] = [];

    for (let i = 0; i < frameCount; i++) {

      const id = `seq${key}-${i}`;
      const src = `${folder}/${String(i).padStart(4, "0")}.png`;

      animationFrames[key].push(`#${id}`);

      promises.push(
        createImage(assetsDiv,id, src)
      );
      
    }
    console.log("promise", promises)
  });

  return Promise.all(promises);
}

function renderImages(images) {
  console.log(images)
  const staticImages = images.slice(0, 4); // CHANGE THE 4 W A VARIABLE, how many img should thre be by default without the seq images?

  staticImages.forEach((imgAsset, i) => {


    const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;
    const width = 1.2;
    const height = width / aspectRatio;

    const plane = document.createElement('a-image');

    plane.setAttribute('src', `#${imgAsset.id}`);

    plane.setAttribute(
      'position',
      `${imgPositions[i].x} ${imgPositions[i].y} ${imgPositions[i].z}`
    );

    plane.setAttribute('width', width);
    plane.setAttribute('height', height);

    plane.setAttribute('class', 'object');

    plane.setAttribute(
      "material",
      "transparent: true; alphaTest: 0.5; depthWrite: false"
    );

    planes.push(plane);
    parentEl.appendChild(plane);
  });
}

function playSequence(planeIndex, duration) {

  return new Promise(resolve => {
    console.log(animationFrames, planeIndex)
    const frames = animationFrames[planeIndex];
    console.log(frames)
    let i = 0;

    const interval = setInterval(() => {

      planes[planeIndex].setAttribute(
        "src",
        frames[i]
      );

      i++;

      if (i >= frames.length) {
        clearInterval(interval);
        resolve();
      }

    }, duration / frames.length);
  });
}

  async function loop() {
    while (true) {
      //do add a for loop instead for each sequence in sequence object?? so its more dynamic?
      await playSequence(2, 1000);
      await playSequence(3, 1000);

      await new Promise(r => setTimeout(r, 500));
    }
  }

  async function initScene() {

    // 1. load static images
    const images = await loadImages();
    renderImages(images);
/*     // 2. build animation sequences
    animationFrames[2] = loadSequence("/img/sequence2/", 10, "seq2");
    animationFrames[3] = loadSequence("/img/sequence3/", 8, "seq3");
 */
    // 3. now everything is ready
    loop();
}


  initScene();
}