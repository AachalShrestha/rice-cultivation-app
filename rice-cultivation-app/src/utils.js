export function createImage(assetsDiv, id, src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");

    img.id = id;
    img.src = src;
    img.setAttribute("crossorigin", "anonymous");

    img.onload = () => resolve(img);
    img.onerror = reject;

    assetsDiv.appendChild(img);
  });
}