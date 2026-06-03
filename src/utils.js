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
export function createARScanner(steps, sceneEl, onTargetFound) {

  const entities = [];
  let active = true;

  steps.forEach((target, index) => {

    const entity = document.createElement("a-entity");

    entity.setAttribute(
      "mindar-image-target",
      `targetIndex: ${index}`
    );

    entity.setAttribute("id", `target${index}`);

    const handler = () => {
      if (!active) return;

      console.log("target found", index);

      onTargetFound(index);
    };

    entity.addEventListener("targetFound", handler);

    sceneEl.appendChild(entity);
    entities.push(entity);
  });

  return {
    destroy() {
      active = false;

      entities.forEach((el) => {
        el.remove();
      });
    }
  };
}
export default async function showTemporaryMessage(element, duration) {
  element.classList.add("show");

  setTimeout(() => {
    element.classList.remove("show");
  }, duration);
}
