import gsap from "gsap";

export function layer1(parentEl) {
/*   const THREE = AFRAME.THREE; */
  const imgPositions = [
    { x: 0,   y: 0,   z: 0.1 },
    { x: 0,   y: 0,   z: 0.3 },
    { x: 0,   y: 0,   z: 0.4},
    { x: 0,   y: 0,   z: 0.8 },
  ];
const assetsDiv = document.querySelector('a-assets');

const imagePaths = Array.from({ length: 4 }, (_, i) =>
  `/layer1-img/layer1_000${i}.png`
);

async function loadImages() {
  
  const textures = await Promise.all(
    imagePaths.map((src, i) => {
      return new Promise((resolve, reject) => {
        const img = document.createElement('img');

        img.id = `texture-${i}`;
        
        img.classList.add("image")
        img.src = src;

    
        img.setAttribute('crossorigin', 'anonymous');

        img.onload = () => resolve(img);
        img.onerror = reject;

        assetsDiv.appendChild(img);
      });
    })
  );
  console.log("hello", textures)
  return textures;
}

function renderImages(images) {
  images.forEach((imgAsset, i) => {

    const aspectRatio = imgAsset.naturalWidth / imgAsset.naturalHeight;
    const width = 1.2
    const height = width / aspectRatio;

    const plane = document.createElement('a-image');
    plane.setAttribute('src', `#${imgAsset.id}`);
    plane.setAttribute(
      'position',
      `${imgPositions[i].x} ${imgPositions[i].y} ${imgPositions[i].z}`
    );
    /* plane.setAttribute('height', 0.8); */
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
  await loadImages();     // 1. wait until ALL images are loaded
  renderImages([...assetsDiv.querySelectorAll('img')]); // 2. then render
}

initScene();
   

}



