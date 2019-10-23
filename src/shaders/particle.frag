precision mediump float;

/**
 * Create a circle mask
 * @param  {float} in vec2          uv     Texture cordinate
 * @param  {float} in float         radius Circle's radius
 * @return {float}    A mask for drawing circle
 */
float circle(in vec2 uv, in float radius){
  vec2 dist = uv - vec2(0.5);
  return 1.-smoothstep(
    radius - (radius * 0.01),
    radius + (radius * 0.01),
    dot(dist, dist) * 4.0
  );
}

void main() {
  float mask = circle(gl_PointCoord.xy, 1.0);
  if (mask == 0.0)  
    discard;
 
  gl_FragColor = vec4(1, 0, 0.5, 1.0); 
}
