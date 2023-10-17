import GameObj from "@sparklicorn/bucket-ts/build/engine/GameObj";
import Poly from "@sparklicorn/bucket-ts/build/engine/Polygon";
import Scene from "@sparklicorn/bucket-ts/build/engine/Scene";
import Vector from "@sparklicorn/bucket-ts/build/structs/Vector";

const scene = new Scene({
  width: 600,
  height: 400,
  viewWidth: 600,
  viewHeight: 400
});

scene.background = '#33bb33';

scene.addObj(
  new GameObj({
    poly: new Poly({
      points: [
        { x: 0, y: 0 },
        { x: 0, y: 100 },
        { x: 100, y: 100 },
        { x: 100, y: 0 }
      ]
    }),
    location: { x: 0, y: 0 },
    velocity: new Vector({ x: 191, y: 253 }),
    angularVelocity: Math.PI / 2
  })
);

export default scene;
