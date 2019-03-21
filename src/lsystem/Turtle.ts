import {vec3, mat4, quat, vec4} from 'gl-matrix';
//A Turtle class to represent the current drawing state of your L-System.
// It should at least keep track of its current position, current orientation,
// and recursion depth (how many [ characters have been found while drawing before ]s)
export default class Turtle {

  position: vec3;
  orientation: quat;
  depth: number; // Height will be halved as depth increases
  scale: vec2;
  step: number;


  constructor(pos: vec3, orient: quat) {
    this.position = pos;
    this.orientation = orient;
    this.depth = 0;
    this.scale = vec3.fromValues(1.0, 1.0);
    this.step = 5.5;
  }

  rotate(x: number, y:number, z:number): void {
    let tmp = quat.create();
    quat.fromEuler(tmp, x, y, z);
    quat.multiply(this.orientation, this.orientation, tmp);
  }

  moveForward(dist: number, type: string): void{

    let R: mat4 = mat4.create();
    mat4.fromQuat(R, this.orientation);
    let forward :vec3 = vec3.create();
    let up = vec3.fromValues(0, 1, 0);
    vec3.transformMat4(forward, up, R);
    let prevPos:vec3 = vec3.create();
    vec3.copy(prevPos,this.position);
    // if (type == 'l') {
    //   vec3.scaleAndAdd(this.position,this.position,forward, this.scale[0] * (this.step + 1.0));
    // } else {
    vec3.scaleAndAdd(this.position,this.position,forward, this.scale[0] * this.step);
    // }
    //
    // this.scale[0]= this.scale[0] * Math.pow(0.95, this.depth);
    // this.scale[1] = this.scale[1] * Math.pow(0.95, this.depth);
    this.depth++;
  }

  getTransformation(type: string): mat4 {// mat = T * R * S

    let T = mat4.create();
    let R = mat4.create();
    let S = mat4.create();
    let trans = mat4.create();

    mat4.fromTranslation(T, this.position);
    mat4.fromQuat(R, this.orientation);

    if (type == 'b') {
      mat4.fromScaling(S, this.scale);
    } else {
      let factor = 0.008 * Math.pow(0.95, this.depth);
      mat4.fromScaling(S, vec3.fromValues(factor, factor, factor));
    }
    mat4.multiply(trans,T, R);
    mat4.multiply(trans, trans, S);
    return trans;
    }
}
