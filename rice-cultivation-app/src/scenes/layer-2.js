import gsap from "gsap";

export function layer2(parentEl) {

  const planes = []; // ✅ now shared inside everything

  const imgPositions = [
    { x: 0, y: 0, z: 0.1 },
    { x: 0, y: 0, z: 0.3 },
    { x: 0, y: 0, z: 0.4 },
    { x: 0, y: 0, z: 0.8 },
  ];

  const assetsDiv = document.querySelector('a-assets');

  const imagePaths = Array.from({ length: 4 }, (_, i) =>
    `/layer2-img/layer2_000${i}.png`
  );

  async function loadImages() {
    return Promise.all(
      imagePaths.map((src, i) => {
        return new Promise((resolve, reject) => {
          const img = document.createElement('img');

          img.id = `texture-${i}`;
          img.src = src;
          img.setAttribute('crossorigin', 'anonymous');

          img.onload = () => resolve(img);
          img.onerror = reject;

          assetsDiv.appendChild(img);
        });
      })
    );
  }

  function renderImages(images) {
    images.forEach((imgAsset, i) => {

      const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;
      const width = 1.2;
      const height = width / aspectRatio;

      const plane = document.createElement('a-image');
      plane.setAttribute('src', `#${imgAsset.id}`);
      plane.setAttribute('position',
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

  function playSequence(planeIndex, start, end, duration) {
    return new Promise(resolve => {
      let frame = start;

      const interval = setInterval(() => {

        planes[planeIndex].setAttribute(
          'src',
          `#texture-${frame}`
        );

        frame++;

        if (frame >= end) {
          clearInterval(interval);
          resolve();
        }
      }, duration / (end - start));
    });
  }

  async function loop() {
    while (true) {
      await playSequence(2, 0, 2, 1000);
      await playSequence(3, 0, 2, 1000);

      await new Promise(r => setTimeout(r, 500));
    }
  }

  async function initScene() {
    const imgs = await loadImages();

    renderImages(imgs);

    loop();
  }

  initScene();
}