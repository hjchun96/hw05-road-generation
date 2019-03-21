// Checks for population density
// SO branch, then see if it endpoint meets threshold
import { vec2, vec3, mat4, quat } from 'gl-matrix';
export default class ExpansionRule {
  // precondition: string;
  branch_expansions: Map<number, string> = new Map();
  leaves_expansions: Map<number, string> = new Map();

  constructor(branch_expansions: Map<number, string>, leaves_expansions: Map<number, string>) {
    this.branch_expansions = branch_expansions;
  }

  expand_branch() : string {
    let rand = Math.random();
    if (rand < 0.25) {
      return this.branch_expansions.get(0.2);
    } else if (rand < 0.5) {
      return this.branch_expansions.get(0.4);
    } else if (rand < 0.75) {
      return this.branch_expansions.get(0.6);
    } else  {
      return this.branch_expansions.get(0.8);
    }
  }

  expand_leaves() : string {
    return this.leaves_expansions.get(0.0);
  }

  fract() : number {

  }

  hash3(vec2 p) : vec3 {
      vec3 q = vec3.fromValues( Math.dot(p, vec2.fromValues(127.1,311.7)),
              				   				Math.dot(p, vec2.fromValues(269.5,183.3)),
              				   				Math.dot(p, vec2.fromValues(419.2,371.9)));
      let val = Math.sin(q) * 43758.5453;
  	  return vec3.fromValues(fract(val[0]), fract(val[1]), fract(val[2]))
  }

  voronoi(x: number, y: number, seed: number): number {

   	let coord = vec2.fromValues(x, y);
    let r1 = seed.x;
    let r2 = seed.y;

    let p = vec2.fromValues(Math.floor(x), Math.floor(y));
    let rem = vec2.fromValues(fract(x), fract(y));

  	let k = 1.0 + 10.0 * pow(1.0 - r2, 4.0);

  	let avg_dist = 0.0;
  	let tot_weight = 0.0;

  	// Check neighbors
    for (let j = -2.0; j <= 2.0 ;  j = j + 1.0 ) {
    	for (;et i = -2.0; i <= 2.0 ; i = i + 1.0) {

        let coord = vec2.fromValues(i, j);
  			let rand_coord = hash3(p + coord) * vec3(r1, r1, 1.0);
  			let r = coord - rem + rand_coord.xy;
  			let dist = dot(r,r);
  			let weight = pow( 1.0 - smoothstep(0.0, 2.03, sqrt(dist)), k );
  			avg_dist += rand_coord.z * weight;
  			tot_weight += weight;
      }
    }
    return avg_dist/tot_weight;
  }
}
