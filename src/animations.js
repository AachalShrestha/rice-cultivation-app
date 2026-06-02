import gsap from "gsap";
let activeControllers = [];

/* ---------------- GSAP ENTRANCE ---------------- */
export default function startAnimation(elements) {
  elements.forEach((el, i) => {

    gsap.set(el, {
      opacity: 0,
      y: 40
    });

    gsap.to(el, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.8,
      ease: "back.out(1.7)",
      delay: i * 0.2
    });

  });
}

/* ---------------- TIMELINE SYSTEM ---------------- */
export function createTimelineRunner() {
  let activeAbort = null;

  async function run(timeline = [], ctx, stepId) {
    if (activeAbort) activeAbort.abort();

    const controller = new AbortController();
    activeAbort = controller;

    for (const action of timeline) {
      if (controller.signal.aborted) return;
      await runAction(action, ctx, stepId, controller.signal);
    }
  }

  function stop() {
    if (activeAbort) activeAbort.abort();
    activeAbort = null;
  }

  return { run, stop };
}

/* ---------------- ACTION ROUTER ---------------- */
async function runAction(action, ctx, stepId, signal) {
  if (signal?.aborted) return;
  console.log(action)
  switch (action.type) {

    case "timeline":
    for (const step of action.steps || []) {
      await runAction(step, ctx, stepId, signal);
    }
    return;

    case "sequence":
      if (action.loop) {
        runSequence(action, ctx, stepId, signal); // no await
        return;
      }
      return await runSequence(action, ctx, stepId, signal)

    case "parallel":
      return Promise.all(
        action.steps.map(a => runAction(a, ctx, stepId, signal))
      );

    case "transform":
      return runTransform(action, ctx, signal);
  }
}

/* ---------------- SEQUENCE (PNG) ---------------- */
async function runSequence(action, ctx, stepId, signal) {
  const imgs = Array.from(ctx.querySelectorAll("img"));
  const img = imgs[action.imgIndex] || imgs[0];
  if (!img) return;

  const frames = Array.from(
    { length: action.frames },
    (_, i) =>
      `/layer${stepId}-img/png-sq-${action.imgIndex}/${String(i).padStart(4, "0")}.png`
  );

  const frameDuration = action.duration / frames.length;

  return new Promise((resolve) => {
    let i = 0;

    function play() {
      if (signal?.aborted) {
        return resolve(); // stop immediately if scene changed
      }

      img.src = frames[i];
      i++;

      if (i >= frames.length) {
        if (action.loop) {
          i = 0; // loop
        } else {
          return resolve(); // ✅ FINISHED → timeline can continue
        }
      }

      setTimeout(play, frameDuration);
    }

    play();
  });
}

/* ---------------- TRANSFORM ---------------- */
async function runTransform(action, ctx, signal) {
  const el = ctx.querySelectorAll("img")[action.target];
  if (!el) return;

  const tween = gsap.to(el, {
    x: action.to.x,
    y: action.to.y,
    duration: action.duration
  });

  signal?.addEventListener("abort", () => tween.kill());

  return tween;
}

/* ---------------- PNG PLAYER ---------------- */
export function playFrames(imgEl, frames, delay = 100, loop = false) {
  let i = 0;
  let stopped = false;

  const controller = {
    stop: () => {
      stopped = true;
    }
  };

  activeControllers.push(controller);

  function tick() {
    if (stopped) return;

    imgEl.src = frames[i];
    i++;

    if (i >= frames.length) {
      if (loop) i = 0;
      else return;
    }

    setTimeout(tick, delay);
  }

  tick();

  return controller;
}

export function stopAllAnimations() {
  activeControllers.forEach(c => c.stop());
  activeControllers = [];
}