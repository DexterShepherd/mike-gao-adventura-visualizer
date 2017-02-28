let THREE = require('three-js')();
const p5 = require('p5');
const sound = require('p5/lib/addons/p5.sound.js');
const dom = require('p5/lib/addons/p5.dom.js');


new p5(p => {
  let input, detail, count, spectrum, peaks,
    drumFFT, drum, bp,
    playback, mute, thresh_contol, thresh, debug,
    speed, size, num_circles, radius, particles

  p.preload = function() {
    playback = p.loadSound('data/mike-gao.mp3');
    drum = p.loadSound('data/mike-gao-drum.mp3');
  }

  p.setup = function() {
    setupAudio();
    debug = false;
  }

  p.draw = function() {
    drumFFT.analyze();
    let en = drumFFT.getEnergy(440);
    audioTrigger = en;
  }

  function setupAudio() {
    drumFFT = new p5.FFT();
    drum.disconnect();
    bp = new p5.LowPass();
    bp.freq(440);
    bp.disconnect();
    drum.connect(bp);
    drumFFT.setInput(bp);
    playback.loop();
    drum.loop();
    mute = new p5.Gain();
    drum.connect(mute);
    mute.amp(0);
  }
});

class Particle {
  constructor(l, point_index) {
    this.loc = new THREE.Vector3(); 
    this.loc.copy(l); 

    this.index = point_index;
    this.limit = 2 + Math.random() * 20;

    this.vel = new THREE.Vector3(_random(30),
                                 _random(30),
                                 _random(30)); 
                                 
    this.acc = new THREE.Vector3(0, 0, 0); 
  }

  update(num_circles) {
    this.theta = mapRange(this.index % num_circles, 0, 5, 0, Math.PI * 2);

    this.dest = new THREE.Vector3(
      Math.sin(speed + (this.theta * Math.sin(speed) + Math.PI)) * 150,
      Math.cos(speed + (this.theta * Math.cos(speed) + Math.PI)) * 150,
      0,
    );

    this.acc = this.dest.sub(this.loc);
    this.acc.normalize();
    this.acc.multiplyScalar(0.5);
    // this.vel.min(new THREE.Vector3(Math.sin(speed) + Math.PI * this.limit, Math.sin(speed) + Math.PI * this.limit, Math.sin(speed) + Math.PI * this.limit));
    this.vel.min(new THREE.Vector3(this.limit,this.limit, this.limit));
    this.vel.add(this.acc);
    this.loc.add(this.vel);

    if (Math.random() > 0.999) {
      this.index = (this.index + 1 % num_circles);
    }

    return this.loc;  
  }
}

let container, clock = new THREE.Clock(true);
let camera, scene, renderer, particles, geometry, materials = [], parameters, i, h, color, size;
let dests, sphere, testers = [], speed = 0, num_points = 1;
let movers;
let mouseX = 0, mouseY = 0;
let audioTrigger = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();

function init() {
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 3000 );
  camera.position.z = 1000;
  scene = new THREE.Scene();
  // scene.fog = new THREE.FogExp2( 0x000000, 0.0007 );

  geometry = new THREE.Geometry();

  movers = [];

  for ( i = 0; i < 20000; i ++ ) {
    var vertex = new THREE.Vector3(0, 0, 0);
    geometry.vertices.push( vertex );
    movers.push(new Particle(vertex, i % num_points));
  }

  parameters = [
    [ [1, 1, 1], 5 ],
  ];

  for ( i = 0; i < parameters.length; i ++ ) {

    color = parameters[i][0];
    size  = parameters[i][1];

    let tex = new THREE.TextureLoader().load('images/circle2.png');
    materials[i] = new THREE.PointsMaterial( { size: size, map: tex, color: 0xffffff } );
    particles = new THREE.Points( geometry, materials[i] );

    // particles.rotation.x = Math.random() * 6;
    // particles.rotation.y = Math.random() * 6;
    // particles.rotation.z = Math.random() * 6;

    scene.add( particles );
  }

  // dests = new THREE.SphereGeometry( 200, 10, 5 );
  // var material = new THREE.MeshBasicMaterial( {wireframe: true} );
  // sphere = new THREE.Mesh( dests, material );
  // scene.add( sphere );

  for(let i = 0; i < 5; i++) {
    let geom = new THREE.SphereGeometry( 30, 10, 10 );
    let material = new THREE.MeshBasicMaterial( {wireframe: true} );
    let sphere = new THREE.Mesh( geom, material );
    // scene.add( sphere );
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

function animate() {
  speed += 0.02;
  particles.geometry.vertices.forEach( (v, index) => {
    if(audioTrigger > 202) {
      movers[index].vel.copy(new THREE.Vector3(_random(5), _random(5), _random(5))); 

      num_points = Math.floor(Math.random() * 4) + 1;
    }

    v.copy( movers[index].update(num_points) );
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
