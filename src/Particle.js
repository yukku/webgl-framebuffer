export default class Particle {
  static get radius() {
    return 30;
  }

  constructor(props) {
    const { x, y } = props;

    this.position = { x: x, y: y };
    this.velocity = { x: Math.random() - 0.5, y: -Math.random() * 0.8 };
    this.restitution = -0.8;
    this.mass = 30;
  }
}
