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

  steps.forEach((target) => {

    const entity = document.createElement("a-entity");

    entity.setAttribute(
      "mindar-image-target",
      `targetIndex: ${target.id}`
    );

    entity.setAttribute("id", `target${target.id}`);

    const handler = () => {
      if (!active) return;

      console.log("target found", target.id);

      onTargetFound(target.id);
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