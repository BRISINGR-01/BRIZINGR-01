import { Body } from "cannon";
import {
  AnimationMixer,
  Clock,
  Group,
  Vector3,
  type AnimationAction,
} from "three";
import type Controls from "./Controls";
import { load } from "./world/utils";
import type World from "./world/world";

const clock = new Clock();

const velocity = new Vector3();
const direction = new Vector3();

export default class Character extends Group {
  private isJumping = false;
  private isBeingFixed = false;
  private animation: AnimationAction;
  public hitbox = new Body();

  constructor(object: Group, animation: AnimationAction) {
    super();
    this.add(object);
    this.animation = animation;
  }

  static async load(world: World) {
    const cyclistGltf = await load("cyclist", "glb");
    const characterObject = cyclistGltf.scene;

    characterObject.traverse(function (node) {
      if (node.isObject3D) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });

    characterObject.position.y = -1;
    world.camera.lookAt(characterObject.position);

    const mixer = new AnimationMixer(characterObject);
    const animation = mixer.clipAction(cyclistGltf.animations[0]);
    animation.play();
    world.onRender(() => mixer.update(clock.getDelta()));
    world.add(characterObject, cyclistGltf.animations[0]);

    return new Character(characterObject, animation);
  }

  checkForFlipover() {
    console.clear();

    console.log(this.rotation.x + this.rotation.z);
    if (this.isBeingFixed) {
      // this.hitbox.chassisBody.applyForce(0.2);
      this.hitbox.position.y += 0.2;
      // this.hitbox.this.hitbox.rotation.z -= this.rotation.z / 10;
    }

    this.isBeingFixed = Math.abs(this.rotation.x + this.rotation.z) > 0.4;
  }

  update(world: World, controls: Controls) {
    velocity.multiplyScalar(0.95);

    direction.x = Number(controls.right) - Number(controls.left);
    direction.y = Number(controls.space); // - Number(controls.shift);
    direction.z = Number(controls.up) - Number(controls.down);
    direction.normalize(); // this ensures consistent movements in all directions

    velocity.x += direction.x / 10;
    velocity.z += direction.z / 10;
    if (this.isJumping) {
      if (velocity.y < 0.001) this.isJumping = false;
    } else {
      velocity.y += direction.y / 20;
      if (velocity.y > 0.2) this.isJumping = true;
    }

    this.animation.timeScale = velocity.x + velocity.z;

    // this.checkForFlipover();
  }
}