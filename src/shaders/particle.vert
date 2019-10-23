attribute vec2 position;
uniform float radius;

void main() {
  gl_PointSize = radius * 2.0;
  gl_Position = vec4(position, 0.0, 1.0);
}
