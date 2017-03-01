let THREE = require('three-js')();

class Particle {
  constructor(l, point_index) {
    this.loc = new THREE.Vector3();
    this.loc.copy(l);

    this.index = point_index;
    this.limit = 1;
    this.scaler = 1.1;

    this.vel = new THREE.Vector3(_random(10),
                                 _random(10),
                                 _random(10));

    this.acc = new THREE.Vector3(0, 0, 0);
  }

  update(num_circles, speed) {
    this.theta = mapRange(this.index % num_circles, 0, 5, 0, Math.PI * 2);

    if(Math.random()  > 0.99) {
      this.vel.copy(new THREE.Vector3(0, 0, 0));
    }

    this.dest = new THREE.Vector3(
      Math.sin(speed + (this.theta * Math.sin(speed) + Math.PI)) * 400,
      Math.cos(speed + (this.theta * Math.cos(speed) + Math.PI)) * 250,
      Math.sin(speed + this.theta) * Math.cos(speed + this.theta) * 350,
    );

    this.acc.copy(this.dest.sub(this.loc));
    this.acc.normalize();
    this.acc.multiplyScalar(this.scaler);
    this.vel.add(this.acc);
    this.loc.add(this.vel);

    // if(this.loc.distanceTo(this.dest) > 2000) {
    //    this.vel.copy(new THREE.Vector3(0, 0, 0));
    //    return (this.dest);
    // }
    if (Math.random() > 0.999) {
      this.index = (this.index + 1 % num_circles);
    }

    return this.loc;
  }
}

function mapRange(value, oldMin, oldMax, newMin, newMax) {
  return (((value - oldMin) * (newMax - newMin)) / (oldMax - oldMin)) + newMin;
}

function _random(size) {
  return (Math.random() * size ) - ( size / 2.0 );
}

module.exports = {
 Particle: Particle
}
