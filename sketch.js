let THREE = require('three-js')(['OBJLoader']);
const p5 = require('p5');
const sound = require('p5/lib/addons/p5.sound.js');
const dom = require('p5/lib/addons/p5.dom.js');
const NOC = require('./src/particle.js');

const Fade = require('fade');



new p5(p => {
  let input, drumFFT, drum, lp, playback, mute;

  p.preload = function() {
    // playback = p.loadSound('data/mike-gao.mp3');
    // drum = p.loadSound('data/mike-gao.mp3');
    
    let audioPath = 'humbled.mp3';
    drum = p.loadSound('data/mike-gao-drum.mp3');
    playback = p.loadSound('data/mike-gao.mp3');
  }

  p.setup = function() {
    // move default canvas out of the way
    let c = p.createCanvas(0, 0);
    c.position(-9999, -9999);
    setupAudio();
    init();
    animate();

    playback.onended( () => {
      ended = true; 
      let controls = document.querySelector('#ended');
      Fade.in(controls, 2000);
    });
  }

  p.draw = function() {
    drumFFT.analyze();
    let en = drumFFT.getEnergy(440);
    audioTrigger = en;
  }

  function setupAudio() {
    drumFFT = new p5.FFT();
    drum.disconnect();
    lp = new p5.LowPass();
    //440
    lp.freq(440);
    lp.disconnect();
    drum.connect(lp);
    drumFFT.setInput(lp);
    playback.play();
    drum.play();
    mute = new p5.Gain();
    drum.connect(mute);
    mute.amp(0);
  }
});


let container, clock = new THREE.Clock(true), clockBig = new THREE.Clock(true);
let camera, scene, renderer, particles, geometry, material, parameters, i, h, color, size;
let dests, sphere, testers = [], speed = 0, num_points = Math.round(Math.random() * 10);
let movers;
let mouseX = 0, mouseY = 0;
let audioTrigger = 0;
let composer;
let timeSinceLastTrigger = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

let text = null;
let loaded = false;

let exploded = false;
let trigger = false;
let triggerBig = false;

let ended = false;

function init() {
  container = document.createElement( 'div' );
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-1';
  document.body.appendChild( container );
  
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 1000;
  scene = new THREE.Scene();
  geometry = new THREE.Geometry();
  movers = [];

  for ( i = 0; i < 60000; i ++ ) {
    var vertex = new THREE.Vector3(_random(window.innerWidth), _random(window.innerHeight), _random(1000));
    geometry.vertices.push( vertex );
    movers.push(new NOC.Particle(vertex, i % num_points));
  }


  material = new THREE.PointsMaterial( { size: 2, color: 0xffffff } );
  particles = new THREE.Points( geometry, material );

  scene.add( particles );

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );


  container.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
  
  let replay = document.querySelector("#restart")

  replay.addEventListener( 'click', restart, false);

  let hero = document.querySelector('#hero');
  Fade.in(hero, 10000);

  setTimeout( () => {
    Fade.out(hero, 10000);
  }, 5000)

  // setTimeout( () => { 
  //     ended = true; 
  //     let controls = document.querySelector('#ended');
  //     Fade.in(controls, 2000);
 // }, 10000);
}


function restart() {
  location.reload();
}

function animate() {
  if(ended) { return }

  speed += mapRange(audioTrigger, 0, 255, 0.001, 0.020);

  trigger = ((audioTrigger > 200) && (clock.getDelta() > 0.05));
  triggerBig = ((audioTrigger > 210) && (clockBig.getDelta() > 0.05));


  particles.geometry.vertices.forEach( (v, index) => {

    if ( exploded ) {
      movers[index].scaler = 0.01;
      movers[index].vel.copy( new THREE.Vector3(0, 0, 0) );
      exploded = false;
    }

    if(trigger) {
      movers[index].vel.copy(new THREE.Vector3(_random(10), _random(10), _random(10)));
      num_points = Math.floor(Math.random() * 20) + 1;
      movers[index].scaler = 1 - movers[index].scaler;
      if( triggerBig ) {
        movers[index].scaler = Math.random() * 3;
        exploded = true
      }
    }
    v.copy( movers[index].update(v, num_points, speed) );
  })

  particles.rotation.z = speed * 0.01;
  particles.geometry.verticesNeedUpdate = true;

  requestAnimationFrame( animate );
  render();

  trigger = false;
  triggerBig = false;
}

function render() {
  var time = Date.now() * 0.00005;
  camera.position.x += ( mouseX - camera.position.x ) * 0.05;
  camera.position.y += ( - mouseY - camera.position.y ) * 0.05;
  camera.lookAt( scene.position );

  renderer.render( scene, camera );
}


function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

function _random(size) {
  return (Math.random() * size ) - ( size / 2.0 );
}


function onWindowResize() {
  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
  mouseX = event.clientX - windowHalfX;
  mouseY = event.clientY - windowHalfY;
}

function onDocumentTouchStart( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}

function onDocumentTouchMove( event ) {
  if ( event.touches.length === 1 ) {
    event.preventDefault();
    mouseX = event.touches[ 0 ].pageX - windowHalfX;
    mouseY = event.touches[ 0 ].pageY - windowHalfY;
  }
}
