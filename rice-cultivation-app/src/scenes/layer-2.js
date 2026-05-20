import { createImage } from "../utils";

const PREFIX = "layer2";

let layer2AssetsLoaded = false;
let layer2Images = null;

export function layer2(parentEl) {

  let isActive = true;
  let activeIntervals = [];
  let loopPromise = null;

  // 🔥 CRITICAL: prevents async race conditions
  let destroyToken = 0;

  const planes = [];

  const imgPositions = [
    { x: 0, y: 0, z: 0.1 },
    { x: 0, y: 0, z: 0.3 },
    { x: 0, y: 0, z: 0.4 },
    { x: 0, y: 0, z: 0.8 },
  ];

  const animationFrames = {};

  const sequences = [
    { id: 2, path: "/layer2-img/png-sq-2", frameCount: 6 },
    { id: 3, path: "/layer2-img/png-sq-3", frameCount: 7 }
  ];

  const assetsDiv = document.querySelector("a-assets");

  const imageStaticPaths = Array.from(
    { length: 4 },
    (_, i) => `/layer2-img/layer2_000${i}.png`
  );

  // ---------------------------
  // DESTROY (FULL STOP)
  // ---------------------------
  function destroy() {

    destroyToken++;

    isActive = false;
    

    // 🚨 IMPORTANT: freeze loop BEFORE DOM removal
    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    // 🚨 WAIT A FRAME so A-Frame doesn't collide with updates
    requestAnimationFrame(() => {

      planes.forEach(p => {
        if (p?.setAttribute) {
          p.setAttribute("visible", false);
          p.removeAttribute("animation__texture"); // safety if any
        }
        p?.remove();
      });

      parentEl.innerHTML = "";
    });
    console.log(PREFIX, isActive)
    loopPromise = null;
  }

  // ---------------------------
  // LOAD ASSETS (CACHE SAFE)
  // ---------------------------
async function loadImages() {

  // ✅ ALWAYS rebuild frame references
  sequences.forEach(seq => {
    animationFrames[seq.id] = [];

    for (let i = 0; i < seq.frameCount; i++) {
      const id = `${PREFIX}-seq${seq.id}-${i}`;
      animationFrames[seq.id].push(`#${id}`);
    }
  });

  // ✅ THEN handle caching
  if (layer2AssetsLoaded) return layer2Images;

  const promises = [];

  imageStaticPaths.forEach((src, i) => {
    promises.push(
      createImage(assetsDiv, `${PREFIX}-texture-${i}`, src)
    );
  });

  sequences.forEach(seq => {
    for (let i = 0; i < seq.frameCount; i++) {
      const id = `${PREFIX}-seq${seq.id}-${i}`;
      const src = `${seq.path}/${String(i).padStart(4, "0")}.png`;

      promises.push(createImage(assetsDiv, id, src));
    }
  });

  const myToken = destroyToken;

  layer2Images = await Promise.all(promises);

  if (myToken !== destroyToken) return null;

  layer2AssetsLoaded = true;
  return layer2Images;
}

  // ---------------------------
  // RENDER
  // ---------------------------
  function renderImages(images) {
    isActive = true;
    const staticImages = images.slice(0, 4);

    staticImages.forEach((imgAsset, i) => {

      const pos = imgPositions[i];
      if (!pos) return;

      const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;
      const width = 1.2;
      const height = width / aspectRatio;

      const plane = document.createElement("a-image");

      plane.setAttribute("src", `#${PREFIX}-texture-${i}`);
      plane.setAttribute(
        "position",
        `${pos.x} ${pos.y} ${pos.z}`
      );

      plane.setAttribute("width", width);
      plane.setAttribute("height", height);
      plane.setAttribute("class", "object");

      plane.setAttribute(
        "material",
        "transparent: true; alphaTest: 0.5; depthWrite: false"
      );

      planes.push(plane);
      parentEl.appendChild(plane);
    });
  }

  // ---------------------------
  // SEQUENCE
  // ---------------------------
function playSequence(planeIndex, duration, token) {

  return new Promise(resolve => {

    const frames = animationFrames[planeIndex];
    const plane = planes[planeIndex];

    if (!frames || !plane) {
      resolve();
      return;
    }

    let i = 0;

    const interval = setInterval(() => {

      if (!isActive || token !== destroyToken) {
        clearInterval(interval);
        resolve();
        return;
      }

      if (!plane || !plane.parentNode) {
        clearInterval(interval);
        resolve();
        return;
      }

      plane.setAttribute("src", frames[i]);

      i++;

      if (i >= frames.length) {
        clearInterval(interval);
        resolve();
      }

    }, duration / frames.length);

    activeIntervals.push(interval);
  });
}

  // ---------------------------
  // LOOP (SAFE)
  // ---------------------------
async function loop(token) {

  while (isActive) {

    await playSequence(3, 1000, token);
    if (!isActive) break;

    await playSequence(2, 3000, token);
    if (!isActive) break;

    await new Promise(r => setTimeout(r, 500));
  }
}

  function startLoop() {
    if (!isActive) return;

    const myToken = destroyToken;

    loopPromise = loop(myToken);
  }

  // ---------------------------
  // INIT
  // ---------------------------
  async function initScene() {

    const images = await loadImages();

    if (!images || !isActive) return;

    renderImages(images);

    if (!isActive) return;

    startLoop();
  }

  initScene();

  return { PREFIX, destroy };
}