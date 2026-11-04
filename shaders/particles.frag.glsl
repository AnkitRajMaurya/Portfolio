varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - vec2(0.5);
  if (length(coord) > 0.5) discard;
  float circle = smoothstep(0.5, 0.2, length(coord));
  vec3 amber = vec3(0.851, 0.467, 0.271);
  gl_FragColor = vec4(amber, vAlpha * circle * 0.4);
}
