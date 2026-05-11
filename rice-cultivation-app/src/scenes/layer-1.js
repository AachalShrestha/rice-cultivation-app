import gsap from "gsap";

export function layer1(parentEl) {
/*   const THREE = AFRAME.THREE; */
  const imgPositions = [
    { x: -0.3,   y: 0.3,   z: 0.4 },
    { x: 0.6,   y: 0.2, z: 0.2 },
    { x: -0.5,  y: -0.6, z: 0.1 },
    { x: 0, y: 0.5,   z: -0.1 },
    { x: 0.1, y: -0.5,   z: -0.1 },
  ];
const assetsDiv = document.querySelector('a-assets');

const imagePaths = Array.from({ length: 6 }, (_, i) =>
  `/layer1-img/rice__000${i}.png`
);

async function loadImages() {
  const textures = await Promise.all(
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

  return textures;
}

function renderImages(images) {
  images.forEach((imgAsset, i) => {
    const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;

    const plane = document.createElement('a-image');
    plane.setAttribute('src', `#${imgAsset.id}`);
    plane.setAttribute('position', ` ${imgPositions[i].x}, ${imgPositions[i].y}, ${imgPositions[i].z}`);
    /* plane.setAttribute('height', 0.8); */
    plane.setAttribute('class', 'object');

    parentEl.appendChild(plane);
  });
}

async function initScene() {
  await loadImages();     // 1. wait until ALL images are loaded
  renderImages([...assetsDiv.querySelectorAll('img')]); // 2. then render
}

initScene();
   

}



