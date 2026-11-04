uniform float uTime;
uniform float uProgress;
attribute float aSize;
attribute vec3 aSpeed;
varying float vAlpha;

void main() {
  vec3 pos = position;
  pos.y += sin(uTime * 0.5 * aSpeed.y + pos.x * 0.01) * 30.0;
  pos.x += cos(uTime * 0.4 * aSpeed.x + pos.y * 0.01) * 20.0;
  
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = aSize * (200.0 / -mvPosition.z);
  vAlpha = 0.35 + 0.35 * sin(uTime + pos.x);
}
