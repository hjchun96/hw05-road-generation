import {vec2, vec3} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Square from './geometry/Square';
import ScreenQuad from './geometry/ScreenQuad';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Map': 'Overlay',
  'Population_Density': 'Low',
};

let square: Square;
let screenQuad: ScreenQuad;
let time: number = 0.0;
let population_seed: number[] = [1.87, 4.24];
let elevation_seed: number[] = [1.5, 2.02];

function loadScene() {
  square = new Square();
  square.create();
  screenQuad = new ScreenQuad();
  screenQuad.create();

  // Set Up L-System for Road Generation
  // axiom ='FF';
  // transformations = [];
  // lsystem = new Lsystem(axiom, controls.iteration, population_seed, elevation_seed);
  // lsystem.expandGrammar();
  // lsystem.executeDrawing();

  // setTransArrays(cylinderMesh,lsystem.branch_trans_mat, branchColor);
  // setTransArrays();
}

// Set up instanced rendering data arrays here.
// This example creates a set of positional
// offsets and gradiated colors for a 100x100 grid
// of squares, even though the VBO data for just
// one square is actually passed to the GPU
// function setTransArrays() {
//   let offsetsArray = [];
//   let colorsArray = [];
//   let n: number = 100.0;
//   for(let i = 0; i < n; i++) {
//     for(let j = 0; j < n; j++) {
//       offsetsArray.push(i);
//       offsetsArray.push(0);
//       offsetsArray.push(0);
//
//       colorsArray.push(i / n);
//       colorsArray.push(j / n);
//       colorsArray.push(1.0);
//       colorsArray.push(1.0); // Alpha channel
//     }
//   }
//   let offsets: Float32Array = new Float32Array(offsetsArray);
//   let colors: Float32Array = new Float32Array(colorsArray);
//   square.setInstanceVBOs(offsets, colors);
//   square.setNumInstances(n * n); // grid of "particles"
// }


// function setTransArrays(mesh: Mesh, transformations: mat4[], col: number[]) {
//
//   let colorsArray = [];
//   let trans1Array = [];
//   let trans2Array = [];
//   let trans3Array = [];
//   let trans4Array = [];
//
//   for (let i = 0; i < transformations.length; i++) {
//     let trans = transformations[i];
//
//     trans1Array.push(trans[0]);
//     trans1Array.push(trans[1]);
//     trans1Array.push(trans[2]);
//     trans1Array.push(trans[3]);
//
//     trans2Array.push(trans[4]);
//     trans2Array.push(trans[5]);
//     trans2Array.push(trans[6]);
//     trans2Array.push(trans[7]);
//
//     trans3Array.push(trans[8]);
//     trans3Array.push(trans[9]);
//     trans3Array.push(trans[10]);
//     trans3Array.push(trans[11]);
//
//     trans4Array.push(trans[12]);
//     trans4Array.push(trans[13]);
//     trans4Array.push(trans[14]);
//     trans4Array.push(trans[15]);
//
//     colorsArray.push(col[0]);
//     colorsArray.push(col[1]);
//     colorsArray.push(col[2]);
//     colorsArray.push(1.0);
//   }
//
//   let colors: Float32Array = new Float32Array(colorsArray);
//   let trans1: Float32Array = new Float32Array(trans1Array);
//   let trans2: Float32Array = new Float32Array(trans2Array);
//   let trans3: Float32Array = new Float32Array(trans3Array);
//   let trans4: Float32Array = new Float32Array(trans4Array);
//
//   square.setInstanceVBOs(colors, trans1, trans2, trans3, trans4);
//   square.setNumInstances(transformations.length);
// }

function main() {
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Map', ['Overlay', 'Elevation', 'Population Density']);
  // gui.add(controls, 'Load Scene');

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(50, 50, 10), vec3.fromValues(50, 50, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(0.2, 0.2, 0.2, 1);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE); // Additive blending

  const instancedShader = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/instanced-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/instanced-frag.glsl')),
  ]);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  let prevMap_type = 'Medium';
  let mapType = 1;

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    instancedShader.setTime(time);
    flat.setTime(time++);
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    if(controls.Map != prevMap_type)
    {
        prevMap_type = controls.Map;
        switch(prevMap_type) {
          case "Overlay":
            mapType = 1;
            break;
          case "Elevation":
            mapType = 2;
            break;
          case "Population Density":
            mapType = 3;
            break;
        }
    }

    renderer.clear();
    renderer.render(camera, flat, [screenQuad], mapType);
    renderer.render(camera, instancedShader, [
      square,
    ], mapType);
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
