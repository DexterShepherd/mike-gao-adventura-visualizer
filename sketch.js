let THREE = require('three-js')();
const p5 = require('p5');
const sound = require('p5/lib/addons/p5.sound.js');
const dom = require('p5/lib/addons/p5.dom.js');
const NOC = require('./src/particle.js');


new p5(p => {
  let input, drumFFT, drum, lp, playback, mute;

  p.preload = function() {
    // playback = p.loadSound('data/mike-gao.mp3');
    // drum = p.loadSound('data/mike-gao.mp3');
    let audioPath = 'humbled.mp3';
    playback = p.loadSound(audioPath);
    drum = p.loadSound(audioPath);
  }

  p.setup = function() {
    // move default canvas out of the way
    let c = p.createCanvas(0, 0);
    c.position(-9999, -9999);
    setupAudio();
    init();
    animate();
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
    playback.loop();
    drum.loop();
    mute = new p5.Gain();
    drum.connect(mute);
    mute.amp(0);
  }
});


let container, clock = new THREE.Clock(true);
let camera, scene, renderer, particles, geometry, material, parameters, i, h, color, size;
let dests, sphere, testers = [], speed = 0, num_points = 1;
let movers;
let mouseX = 0, mouseY = 0;
let audioTrigger = 0;
let composer;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;


function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 1000;
  scene = new THREE.Scene();
  geometry = new THREE.Geometry();
  movers = [];

  for ( i = 0; i < 20000; i ++ ) {
    var vertex = new THREE.Vector3(0, 0, 0);
    geometry.vertices.push( vertex );
    movers.push(new NOC.Particle(new THREE.Vector3(_random(1000), _random(1000), _random(1000)), i % num_points));
  }


    let tex = new THREE.TextureLoader().load('images/circle2.png');
    material = new THREE.PointsMaterial( { size: Math.random() * 2, color: 0xffffff } );
    particles = new THREE.Points( geometry, material );

    // particles.rotation.x = Math.random() * 6;
    // particles.rotation.y = Math.random() * 12;
    // particles.rotation.z = Math.random() * 6;

    scene.add( particles );

  for(let i = 0; i < 5; i++) {
    let geom = new THREE.SphereGeometry( 30, 10, 10 );
    let material = new THREE.MeshBasicMaterial( {wireframe: true} );
    let sphere = new THREE.Mesh( geom, material );
    testers.push(sphere);
  }

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );


  container.appendChild( renderer.domElement );
  document.addEventListener( 'mousemove', onDocumentMouseMove, false );
  document.addEventListener( 'touchstart', onDocumentTouchStart, false );
  document.addEventListener( 'touchmove', onDocumentTouchMove, false );
  window.addEventListener( 'resize', onWindowResize, false );
}


let tag = 0;
let exploded = false;

function animate() {
  speed += 0.01;
  particles.geometry.vertices.forEach( (v, index) => {
    if ( exploded ) {
      movers[index].scaler = Math.random();
      movers[index].vel.copy( new THREE.Vector3(0, 0, 0) );
      exploded = false;
    }
    if(audioTrigger > 202) {
      movers[index].vel.copy(new THREE.Vector3(_random(10), _random(10), _random(10)));
      num_points = Math.floor(Math.random() * 20) + 1;
      movers[index].scaler = 1 - movers[index].scaler;
      if( audioTrigger > 230 ) {
        if (tag % 4 == 0) {
          movers[index].scaler = Math.random() * 3;
          exploded = true
        }
        tag++;
      }
    }

    v.copy( movers[index].update(num_points, speed) );
  })

  particles.geometry.verticesNeedUpdate = true;
  requestAnimationFrame( animate );
  render();
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
