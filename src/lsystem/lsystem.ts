import { vec3, mat4, quat } from 'gl-matrix';
import Turtle from './Turtle';
import ExpansionRule from './ExpansionRule';

//A stack of Turtles to represent your Turtle history. Push a copy of your current
// Turtle onto this when you reach a [ while drawing, and pop the top Turtle from the
// stack and make it your current Turtle when you encounter a ]. Note that in TypeScript,
// push() and pop() operations can be done on regular arrays.

export default class LSystem {
    turtle: Turtle;
    turtle_stack: Turtle[];
    // drawing_rules : DrawingRule = new DrawingRule();
    exp_rules: ExpansionRule;
    grammar: string = "";
    num_iterations: number;
    trans_mat: mat4[];

    lr_rot: number;
    ud_rot: number;

    constructor(axiom: string, num_iterations: number, rot_angle: number) {
      this.grammar = axiom;
      this.num_iterations = num_iterations;
      this.lr_rot = rot_angle;// * (Math.PI/180);
      this.ud_rot = rot_angle/2.0;// * (Math.PI/180);
      this.branch_trans_mat = []
      this.leaves_trans_mat =[]
      this.turtle_stack = [];
      let init = quat.create();
      quat.fromEuler(init, 0, 0,0);
      this.turtle = new Turtle(vec3.fromValues(0.0, 0.0, 0.0), init);
      this.setDrawingRules();
      this.setExpansionRules();
   }

    //***  L-System CORE Functions *** //
    // Iterate the ExpansionRules on the gramma
    expandChar(currChar: string): string {
      // if (currChar == 'F') { // I only have rules for F atm
      return this.exp_rules.expand_branch();
      // }
    }

    expandGrammar(): void {
      let newGrammar = this.grammar;
      let tmp = '';
      for (let iter= 0; iter < this.num_iterations; iter++) {
        for (let i=0; i < this.grammar.length; i++) {
          let replacement = this.  `1111  `(newGrammar.charAt(i));
          tmp = tmp.concat(replacement);
        }
        newGrammar = tmp;
      }
      this.grammar = newGrammar;
    }

    // Traverse grammer and apply draw function
    executeDrawing(): void {

      for (let i = 0; i < this.grammar.length; i++) {
        let currChar = this.grammar.charAt(i);
        let dr = this.drawing_rules.rules.get(currChar);
        if (dr) {
          dr();
        }
      }
    }

    // ***  Drawing/Expansion Functions *** //
    rotateLeft(): void {

      let rand = Math.random();
      if (rand > 0.2) {
        this.turtle.rotate(this.lr_rot, 0., 0.);
      } else if (rand > 0.4) {
        this.turtle.rotate(this.lr_rot + 10, 0., 0.);
      }else {
        this.turtle.rotate(0.,this.lr_rot,0. );
      }
    }

    rotateRight(): void{
      let rand = Math.random();
      if (rand > 0.2) {
        this.turtle.rotate(-this.lr_rot, 0., 0.);
      } else if (rand > 0.4) {
        this.turtle.rotate(-this.lr_rot - 10, 0., 0.);
      } else {
        this.turtle.rotate(0., -this.lr_rot,0.);
      }
    }

    turnAround(): void {
        this.turtle.rotate(Math.PI, 0., 0.);
    }

    angleUp(): void {
        this.turtle.rotate(0., 0., this.ud_rot);
    }

    angleDown(): void {
        this.turtle.rotate(0., -0., this.ud_rot);
    }

    drawBranch(): void {

      let curr_trans = this.turtle.getTransformation('b');
      this.branch_trans_mat.push(curr_trans);
      this.turtle.moveForward(4.0, 'b');
    }

    drawLeaves(): void {
      let curr_trans = this.turtle.getTransformation('l');
      this.leaves_trans_mat.push(curr_trans);
      this.turtle.moveForward(3.5 + 3.5 * Math.pow(0.9, this.turtle.depth), 'l');
    }

    pushState(): void {
      let copy = this.copy(this.turtle);
      this.turtle_stack.push(copy);
    }

    popState(): void{
      let popped = this.turtle_stack.pop();
      vec3.copy(this.turtle.position, popped.position);
      quat.copy(this.turtle.orientation, popped.orientation);
      vec3.copy(this.turtle.scale,popped.scale);
      this.turtle.depth = popped.depth;
    }

    copy(turtle: Turtle): Turtle {

      let newPos: vec3 = vec3.create();
      vec3.copy(newPos, turtle.position);

      let newScale: vec3 = vec3.create();
      vec3.copy(newScale, turtle.scale);

      let newOrient: quat = quat.create();
      quat.copy(newOrient, turtle.orientation);

      let newDepth = turtle.depth;
      let dup = new Turtle(newPos, newOrient);
      dup.depth = newDepth;
      dup.scale = newScale;
      return dup;
    }

    setDrawingRules() {
      let dr = new Map();
      dr.set('F', this.drawBranch.bind(this));
      dr.set('L', this.drawLeaves.bind(this));
      dr.set('[', this.pushState.bind(this));
      dr.set(']', this.popState.bind(this));
      dr.set('+', this.rotateRight.bind(this));
      dr.set('-', this.rotateLeft.bind(this));
      dr.set('*', this.turnAround.bind(this));
      dr.set('^', this.angleUp.bind(this));
      dr.set('~', this.angleDown.bind(this));
      this.drawing_rules.rules = dr;
    }

    setExpansionRules() {
      let erb = new Map();
      erb.set(0.2, "FF+[+F-F-FL]-[-F+F+FL]");
      erb.set(0.4,  "FF-[F+^F+FL]-[FL]+[F~FL]");
      erb.set(0.6,  "FF+[F-FL][FL]");
      erb.set(0.8, "FF-[FF*^]-[*FF^FL]");

      let ers = new Map();
      ers.set(0.0, "FL");
      this.exp_rules = new ExpansionRule(erb, ers);
    }


}
