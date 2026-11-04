uniform sampler2D uPortrait;
uniform float uProgress;
uniform float uTime;

varying vec2 vUv;
varying float vLuminance;
varying float vEdge;
varying float vProgress;
varying vec3 vRandom;

void main() {
  // Shape the point into a perfect anti-aliased circle
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) {
    discard;
  }

  // Soft circular edge anti-aliasing
  float alphaCircle = smoothstep(0.5, 0.42, dist);

  // Palette definitions
  vec3 monochromeWhite = vec3(0.941, 0.917, 0.878); // #F0EAE0
  vec3 warmAmber = vec3(0.851, 0.467, 0.271);       // #D97745
  vec3 deepAmber = vec3(1.0, 0.608, 0.329);       // #FF9B54
  vec3 shadowTone = vec3(0.12, 0.11, 0.10);

  // Rim lighting blend: higher on edges and when dispersed
  float amberBlend = smoothstep(0.2, 0.9, vEdge * 0.85 + vRandom.x * 0.25);
  amberBlend = clamp(amberBlend + vProgress * 0.45, 0.0, 1.0);

  vec3 baseColor = mix(monochromeWhite, mix(warmAmber, deepAmber, vRandom.y), amberBlend);

  // Modulate intensity by luminance
  vec3 finalColor = mix(shadowTone, baseColor, smoothstep(0.08, 0.95, vLuminance));

  // Subtle incandescent twinkle
  float twinkle = sin(uTime * 3.0 + vRandom.z * 15.0) * 0.08;
  finalColor += warmAmber * max(0.0, twinkle * vProgress);

  // Fade out smoothly in State 5 (85% to 100% scroll)
  float fadeOut = 1.0 - smoothstep(0.82, 1.0, uProgress);
  float finalAlpha = alphaCircle * clamp(vLuminance * 1.3, 0.25, 1.0) * fadeOut;

  gl_FragColor = vec4(finalColor, finalAlpha);
}
