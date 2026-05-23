

let PREFIX = "layer1";
let layer1AssetsLoaded = false;
let layer1Images = null;

export function layer1(parentEl) {

  const imgPositions = [
    { x: 0, y: 0, z: 0.1 },
    { x: 0, y: 0, z: 0.3 },
    { x: 0, y: 0, z: 0.4 },
    { x: 0, y: 0, z: 0.8 },
  ];

  let isActive = false;
  let activeIntervals = [];

  const assetsDiv = document.querySelector("a-assets");

  const imagePaths = Array.from({ length: 4 }, (_, i) =>
    `/layer1-img/layer1_000${i}.png`
  );

  let staticImages = [];
  const planes = [];

  // ---------------------------
  // LOAD
  // ---------------------------
  async function loadImages() {
    const textures = await Promise.all(
      imagePaths.map((src, i) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');

          img.id = `layer1-texture-${i}`;
          img.classList.add("image");
          img.src = src;
          img.setAttribute('crossorigin', 'anonymous');

          img.onload = () => {
            staticImages.push(img); // 👈 STORE HERE
            resolve(img);
          };

          img.onerror = reject;

          assetsDiv.appendChild(img);
        });
      })
    );

    return textures;
  }

  // ---------------------------
  // RENDER
  // ---------------------------
function renderImages(images) {
    images.forEach((imgAsset, i) => {

      const pos = imgPositions[i];
      if (!pos) return; // 👈 safety guard

      const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;
      const width = 1.2;
      const height = width / aspectRatio;

      const plane = document.createElement('a-image');

      plane.setAttribute('src', `#${imgAsset.id}`);
      plane.setAttribute(
        'position',
        `${pos.x} ${pos.y} ${pos.z}`
      );

      plane.setAttribute('width', width);
      plane.setAttribute('height', height);
      plane.setAttribute('class', 'object');

      plane.setAttribute(
        "material",
        "transparent: true; alphaTest: 0.5; depthWrite: false"
      );

      parentEl.appendChild(plane);
    });
  }

  // ---------------------------
  // START
  // ---------------------------
  async function start() {
    if (isActive) return;
    isActive = true;

    // prevent double-render
    if (planes.length > 0) return;

    const images = await loadImages();
    if (!isActive) return;

    renderImages(images);
  }

  // ---------------------------
  // STOP
  // ---------------------------
  function stop() {
    isActive = false;

    activeIntervals.forEach(clearInterval);
    activeIntervals = [];

    planes.forEach(p => p.remove());
    planes.length = 0;

    staticImages = [];
  }

  return {
    start,
    stop
  };
}