import { createShader, createProgram } from "./webgl";
import Particle from "./Particle";

import ParticleVertexShader from "./shaders/particle.vert";
import ParticleFragmentShader from "./shaders/particle.frag";

export default class App {
  constructor() {
    this.el = document.createElement("div");
    this.el.className = "app";

    const canvas = document.createElement("canvas");
    canvas.className = "canvas";
    canvas.addEventListener("mouseup", this.onMouseUp.bind(this));
    this.el.appendChild(canvas);

    this.gl;
    try {
      this.gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    } catch (error) {
      this.displayError(error);
      return;
    }

    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("DOMContentLoaded", this.onResize.bind(this));

    this.animate = this.animate.bind(this);
    this.initializeShaderProgram = this.initializeShaderProgram.bind(this);

    this.particles = [];
    this.program;
  }

  start() {
    try {
      this.initializeShaderProgram();
      this.setShaderProperties();
      this.animate();
    } catch (error) {
      this.displayError(error);
    }
  }

  createParticles(number) {
    for (let i = 0; i < number; i++) {
      this.particles.push(
        new Particle({
          x: 0,
          y: 0
        })
      );
    }
  }

  getComputedElementDimensions(element) {
    const style = window.getComputedStyle(element);
    const width = style.getPropertyValue("width");
    const height = style.getPropertyValue("height");

    return {
      width: parseInt(width),
      height: parseInt(height)
    };
  }

  onResize() {
    const { gl } = this;
    const { devicePixelRatio } = window;
    const { width, height } = this.getComputedElementDimensions(gl.canvas);

    gl.canvas.width = width * devicePixelRatio;
    gl.canvas.height = height * devicePixelRatio;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  }

  onMouseUp(event) {
    const { gl } = this;
    const { width, height } = this.getComputedElementDimensions(gl.canvas);
    const { clientX, clientY } = event;

    this.particles.push(
      new Particle({
        x: (clientX / width - 0.5) * 2,
        y: -(clientY / height - 0.5) * 2
      })
    );
  }

  initializeShaderProgram() {
    const { gl } = this;

    const vertexShader = createShader(
      gl,
      gl.VERTEX_SHADER,
      ParticleVertexShader
    );
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      ParticleFragmentShader
    );

    this.program = createProgram(gl, vertexShader, fragmentShader);
    gl.useProgram(this.program);
  }

  setShaderProperties() {
    const { gl, program } = this;

    // Setting position attribute
    const positionAttribute = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(positionAttribute);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);

    // Setting radius uniform
    gl.uniform1f(gl.getUniformLocation(program, "radius"), Particle.radius);
  }

  animate() {
    this.render();
    this.setBufferData();

    requestAnimationFrame(this.animate);
  }

  setBufferData() {
    const { gl, particles } = this;
    if (particles.length === 0) return;

    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        particles
          .map(particle => [particle.position.x, particle.position.y])
          .flat()
      ),
      gl.STATIC_DRAW
    );
    gl.drawArrays(gl.POINTS, 0, particles.length);
  }

  render() {
    const { gl, particles } = this;
    const { devicePixelRatio } = window;

    if (particles.length === 0) return;

    // "coefficient of drag", which is influenced by the shape of the object (and a little bit by its material). For a ball, this is 0.47, and is a dimensionless quantity
    const coefficientOfDrag = 0.47;

    // ρ (Greek letter rho) is the density of the fluid the ball is in. If our ball's in air, this value is 1.22 (kg / m3)
    const rho = 0.022; // kg / m^3

    // A is the frontal area or frontal projection of the object. If you look at a silhouette of the object from the front, this is the area of that shape. For a ball, the frontal area is just the area of a circle, or π r2
    const area = (Math.PI * Math.pow(Particle.radius, 2)) / 10000;

    // gravity
    const ag = 2.81;

    const frameRate = 1 / 60;

    const floorResistance = 0.99;

    const particleScreenRadius =
      (Particle.radius / gl.canvas.height) * devicePixelRatio;

    for (let i = 0, length = particles.length; i < length; i++) {
      const particle = particles[i];

      // Newton's 2nd Law of Motion
      let fx =
        (-0.5 *
          coefficientOfDrag *
          area *
          rho *
          Math.pow(particle.velocity.x, 3)) /
        Math.abs(particle.velocity.x);
      let fy =
        (-0.5 *
          coefficientOfDrag *
          area *
          rho *
          Math.pow(particle.velocity.y, 3)) /
        Math.abs(particle.velocity.y);

      fx = isNaN(fx) ? 0 : fx;
      fy = isNaN(fy) ? 0 : fy;

      // Calculate acceleration ( F = ma )
      const accelerationX = fx / particle.mass;
      const accelerationY = ag + fy / particle.mass;

      // Integrate to get velocity
      particle.velocity.x += accelerationX * frameRate;
      particle.velocity.y += accelerationY * frameRate;

      // Integrate to get position
      particle.position.x += particle.velocity.x * frameRate;
      particle.position.y -= particle.velocity.y * frameRate;

      // Handle collisions when hitting the bottom of the screen
      if (particle.position.y < -1 + particleScreenRadius) {
        particle.velocity.y *= particle.restitution;
        particle.velocity.x *= floorResistance;
        particle.position.y = -1 + particleScreenRadius;
      }
    }

    // Remove particles if they go out of screen
    this.particles = particles.filter(
      particle => Math.abs(particle.position.x) < 1 + particleScreenRadius * 2
    );
  }

  getElement() {
    return this.el;
  }

  displayError(error) {
    const { el } = this;
    console.error(error);
    el.innerHTML = `
    <p>
      Sorry! Your browser doesn't seem to support webgl<br/>
      Please try again in different browsers
    </p>`;
  }
}
