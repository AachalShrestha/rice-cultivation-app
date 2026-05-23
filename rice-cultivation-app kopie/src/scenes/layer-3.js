let PREFIX = "layer3"
export function layer3(parentEl) {

  const imgPositions = [
    { x: 0, y: 0, z: 0.1 },
    { x: 0, y: 0, z: 0.3 },
    { x: 0, y: 0, z: 0.4 },
    { x: 0, y: 0, z: 0.8 },
  ];
  let isActive = true;
  let activeIntervals = [];
  const assetsDiv = document.querySelector('a-assets');

  const imagePaths = Array.from({ length: 4 }, (_, i) =>
    `/layer2-img/layer2_000${i}.png`
  );

  let staticImages = []; // 👈 IMPORTANT

  function destroy() {
    isActive = false;

    activeIntervals.forEach(clearInterval);

    // remove planes
   parentEl.querySelectorAll('*').forEach(el => el.remove());

  }

  async function loadImages() {
    const textures = await Promise.all(
      imagePaths.map((src, i) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');

          img.id = `layer3-texture-${i}`;
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

  async function initScene() {
    await loadImages();
    renderImages(staticImages); // 👈 FIXED (NO DOM QUERY)
  }

  initScene();

  return { PREFIX, destroy };
}