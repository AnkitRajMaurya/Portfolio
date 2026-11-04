uniform float uProgress;
uniform float uTime;
uniform float uPixelSize;
uniform float uDisplacement;
uniform vec2 uMouse;
uniform vec2 uResolution;

attribute vec3 aOriginalPosition;
attribute vec3 aRandomSeed;
attribute float aLuminance;
attribute float aEdge;

varying vec2 vUv;
varying float vLuminance;
varying float vEdge;
varying float vProgress;
varying vec3 vRandom;

// Simplex/Perlin noise helper functions for organic curl motion
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vLuminance = aLuminance;
  vEdge = aEdge;
  vProgress = uProgress;
  vRandom = aRandomSeed;

  vec3 pos = aOriginalPosition;

  // Staggered activation: edge and outer particles disperse earlier
  float particleThreshold = smoothstep(0.0, 1.0, (1.0 - aLuminance * 0.4) * (0.8 + aRandomSeed.x * 0.4));
  float localProgress = clamp((uProgress - (1.0 - particleThreshold) * 0.3) / 0.7, 0.0, 1.0);

  // Smooth power curve for cinematic ease
  float easeProgress = pow(localProgress, 1.6);

  if (easeProgress > 0.001) {
    // 3D Curl / Perlin noise velocity field
    vec3 noiseCoord = pos * 0.006 + vec3(uTime * 0.15, uTime * 0.1, aRandomSeed.z);
    vec3 noiseDisp = vec3(
      snoise(noiseCoord),
      snoise(noiseCoord + vec3(43.12, 11.5, 0.0)),
      snoise(noiseCoord + vec3(12.3, 87.2, 5.0))
    );

    // Directional wind vector (upward and slightly outward)
    vec3 windDir = vec3(
      (aRandomSeed.x - 0.5) * 350.0 + (pos.x * 0.4),
      (aRandomSeed.y * 0.8 + 0.2) * 550.0,
      (aRandomSeed.z - 0.5) * 400.0
    );

    // Apply displacement
    pos += (windDir + noiseDisp * 220.0) * easeProgress * uDisplacement;
  }

  // Interactive mouse deflection
  vec2 mouseDiff = pos.xy - uMouse;
  float mouseDist = length(mouseDiff);
  float mouseRadius = 140.0;
  if (mouseDist < mouseRadius && mouseDist > 0.0) {
    float mouseForce = (1.0 - mouseDist / mouseRadius) * 25.0 * (1.0 - uProgress * 0.5);
    pos.xy += (mouseDiff / mouseDist) * mouseForce;
  }

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Point size: modulated by luminance for halftone texture, scaling down as progress advances
  float baseSize = mix(uPixelSize * 0.4, uPixelSize * 1.5, aLuminance);
  float disperseSize = mix(baseSize, baseSize * 0.75, easeProgress);
  
  // Perspective attenuation
  gl_PointSize = disperseSize * (300.0 / -mvPosition.z);
  gl_PointSize = clamp(gl_PointSize, 1.0, 32.0);
}
