import gsap from "gsap";
export default function startAnimation(objects) {
  objects.forEach((obj, i) => {
    const mesh = obj.getObject3D('mesh') || obj.object3D;
    
    // Save original scale first
    const originalX = mesh.scale.x;
    const originalY = mesh.scale.y;
    const originalZ = mesh.scale.z;

    const originalPosX = mesh.position.x;
    const originalPosY = mesh.position.y;
    const originalPosZ = mesh.position.z;

    mesh.scale.set(0, 0, 0); mesh.position.set(0, -2, 0);
    const tl = gsap.timeline()
    tl.to(mesh.scale, {
      x: originalX, 
      y: originalY, 
      z: originalZ, 
      duration: 0.8, 
      ease: "back.out(1.7)", 
      delay: i * 0.3
    }).to(mesh.position,{
      x: originalPosX, 
      y: originalPosY, 
      z: originalPosZ, 
    }, "<");
  });
}
