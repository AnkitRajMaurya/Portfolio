'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap, ScrollTrigger } from '@/animations/gsap/initGsap';

interface ParticlePortraitProps {
  className?: string;
  onScrollProgress?: (progress: number) => void;
}

export default function ParticlePortrait({ className = '', onScrollProgress }: ParticlePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let scene: THREE.Scene | null = null;
    let camera: THREE.PerspectiveCamera | null = null;
    let material: THREE.ShaderMaterial | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let points: THREE.Points | null = null;
    let animationFrameId: number;
    let scrollTriggerInstance: ScrollTrigger | null = null;

    // Uniforms object
    const uniforms = {
      uProgress: { value: 0.0 },
      uTime: { value: 0.0 },
      uPixelSize: { value: window.innerWidth < 768 ? 3.5 : 4.5 },
      uDisplacement: { value: 1.0 },
      uResolution: { value: new THREE.Vector2(container.clientWidth || 800, container.clientHeight || 680) },
    };

    // Custom GLSL Vertex Shader
    const vertexShader = `
      uniform float uProgress;
      uniform float uTime;
      uniform float uPixelSize;
      uniform float uDisplacement;
      uniform vec2 uResolution;

      attribute vec3 aOriginalPosition;
      attribute vec3 aRandomSeed;
      attribute float aLuminance;
      attribute float aEdge;

      varying float vLuminance;
      varying float vEdge;
      varying float vProgress;
      varying vec3 vRandom;

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
        vLuminance = aLuminance;
        vEdge = aEdge;
        vProgress = uProgress;
        vRandom = aRandomSeed;

        vec3 pos = aOriginalPosition;

        // Progressive stagger: edges and shoulders dissolve first
        float startThreshold = clamp((1.0 - aLuminance * 0.3) * (0.6 + aRandomSeed.x * 0.4), 0.0, 1.0);
        float localProgress = clamp((uProgress - (1.0 - startThreshold) * 0.25) / 0.75, 0.0, 1.0);
        float ease = pow(localProgress, 1.5);

        if (ease > 0.001) {
          // Curl noise field
          vec3 nCoord = pos * 0.005 + vec3(uTime * 0.2, uTime * 0.15, aRandomSeed.z * 2.0);
          vec3 noiseVec = vec3(
            snoise(nCoord),
            snoise(nCoord + vec3(23.4, 51.2, 0.0)),
            snoise(nCoord + vec3(9.1, 74.3, 15.0))
          );

          // Directional wind: outward and upward dispersion
          vec3 wind = vec3(
            (aRandomSeed.x - 0.5) * 450.0 + (pos.x * 0.6),
            (aRandomSeed.y * 0.7 + 0.3) * 600.0,
            (aRandomSeed.z - 0.5) * 500.0
          );

          pos += (wind + noiseVec * 260.0) * ease * uDisplacement;
        }

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_Position = projectionMatrix * mvPosition;

        // Halftone dot sizing modulated by luminance
        float baseDot = mix(uPixelSize * 0.35, uPixelSize * 1.45, aLuminance);
        float activeDot = mix(baseDot, baseDot * 0.7, ease);

        gl_PointSize = activeDot * (380.0 / -mvPosition.z);
        gl_PointSize = clamp(gl_PointSize, 1.0, 36.0);
      }
    `;

    // Custom GLSL Fragment Shader
    const fragmentShader = `
      uniform float uProgress;
      uniform float uTime;

      varying float vLuminance;
      varying float vEdge;
      varying float vProgress;
      varying vec3 vRandom;

      void main() {
        vec2 pt = gl_PointCoord - vec2(0.5);
        float d = length(pt);
        if (d > 0.5) discard;

        float alphaCircle = smoothstep(0.5, 0.4, d);

        // Palette
        vec3 silverCream = vec3(0.941, 0.917, 0.878); // #F0EAE0
        vec3 warmAmber = vec3(0.851, 0.467, 0.271);   // #D97745
        vec3 brightAmber = vec3(1.0, 0.62, 0.33);     // #FFA255
        vec3 darkTone = vec3(0.08, 0.08, 0.07);

        // Edge rim lighting
        float rimFactor = smoothstep(0.25, 0.85, vEdge * 0.8 + vRandom.x * 0.3);
        rimFactor = clamp(rimFactor + vProgress * 0.5, 0.0, 1.0);

        vec3 particleCol = mix(silverCream, mix(warmAmber, brightAmber, vRandom.y), rimFactor);
        vec3 color = mix(darkTone, particleCol, smoothstep(0.05, 0.92, vLuminance));

        // Amber sparkle
        float twinkle = sin(uTime * 4.0 + vRandom.z * 20.0) * 0.12;
        color += warmAmber * max(0.0, twinkle * vProgress);

        // Smooth dissolution in final scroll state
        float fadeOut = 1.0 - smoothstep(0.84, 1.0, uProgress);
        float alpha = alphaCircle * clamp(vLuminance * 1.35, 0.3, 1.0) * fadeOut;

        gl_FragColor = vec4(color, alpha);
      }
    `;

    // Try initializing WebGLRenderer safely
    try {
      const width = container.clientWidth || 780;
      const height = container.clientHeight || 680;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
      camera.position.z = 700;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Append canvas directly to container
      renderer.domElement.style.position = 'absolute';
      renderer.domElement.style.top = '0';
      renderer.domElement.style.left = '0';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.pointerEvents = 'none';
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to static visual:', e);
      setWebGLError(true);
      return;
    }

    // Load actual high-resolution portrait photograph of Ankit Raj Maurya
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/img/hero-portrait.png';

    img.onload = () => {
      try {
        const sampleCanvas = document.createElement('canvas');
        const ctx = sampleCanvas.getContext('2d');
        if (!ctx) return;

        const targetW = window.innerWidth < 768 ? 160 : 210;
        const aspect = img.height / img.width;
        const targetH = Math.round(targetW * aspect);

        sampleCanvas.width = targetW;
        sampleCanvas.height = targetH;
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const imgData = ctx.getImageData(0, 0, targetW, targetH).data;

        const positions: number[] = [];
        const randomSeeds: number[] = [];
        const luminances: number[] = [];
        const edges: number[] = [];

        const scale = 2.45;
        const centerX = targetW / 2;
        const centerY = targetH * 0.42; // Center on Ankit's face

        for (let y = 0; y < targetH; y++) {
          for (let x = 0; x < targetW; x++) {
            const idx = (y * targetW + x) * 4;
            const r = imgData[idx];
            const g = imgData[idx + 1];
            const b = imgData[idx + 2];
            const a = imgData[idx + 3];

            // Pure transparent background rejection from clean cutout
            if (a < 40) continue;

            const normX = Math.abs(x - targetW / 2) / (targetW * 0.5);
            const normY = y / targetH;

            const rawLuminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255.0;
            // Ensure hair & dark suit details remain visible as subtle halftone dots
            const luminance = Math.max(0.12, rawLuminance);

            // Feather / fade bottom suit edge so it dissolves seamlessly into black
            let alphaFade = 1.0;
            if (normY > 0.85) {
              alphaFade = Math.max(0.0, 1.0 - (normY - 0.85) / 0.15);
            }
            if (alphaFade <= 0.01) continue;

            // Silhouette edge weighting for incandescent amber rim lighting
            const isHair = (normY < 0.38) && (normX < 0.45) && (rawLuminance < 0.28);
            const edgeWeight = Math.min(1.0, Math.pow(normX * 1.2, 2.0) + (isHair ? 0.35 : 0.0));

            const posX = (x - targetW / 2) * scale;
            const posY = -(y - centerY) * scale;
            const posZ = (Math.random() - 0.5) * 16.0;

            positions.push(posX, posY, posZ);
            randomSeeds.push(Math.random(), Math.random(), Math.random());
            luminances.push(luminance * alphaFade);
            edges.push(edgeWeight);
          }
        }

        geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aOriginalPosition', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aRandomSeed', new THREE.Float32BufferAttribute(randomSeeds, 3));
        geometry.setAttribute('aLuminance', new THREE.Float32BufferAttribute(luminances, 1));
        geometry.setAttribute('aEdge', new THREE.Float32BufferAttribute(edges, 1));

        material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
          transparent: true,
          depthWrite: false,
          blending: THREE.NormalBlending,
        });

        points = new THREE.Points(geometry, material);
        scene?.add(points);

        setIsLoaded(true);

        // GSAP ScrollTrigger timeline to scrub the particle dispersion across 5 states
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: '#hero-stage',
          start: 'top top',
          end: 'bottom+=300 top',
          scrub: 1.0,
          onUpdate: (self) => {
            const progress = self.progress;
            uniforms.uProgress.value = progress;
            if (onScrollProgress) {
              onScrollProgress(progress);
            }
          },
        });
      } catch (err) {
        console.warn('Particle mesh generation issue:', err);
      }
    };

    // Resize handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
      uniforms.uResolution.value.set(newW, newH);
      uniforms.uPixelSize.value = newW < 768 ? 3.5 : 4.5;
    };

    window.addEventListener('resize', handleResize);

    // Animation frame render loop
    let clock = new THREE.Clock();
    const render = () => {
      const delta = clock.getDelta();
      uniforms.uTime.value += delta;

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (scrollTriggerInstance) scrollTriggerInstance.kill();
      if (points && scene) scene.remove(points);
      if (geometry) geometry.dispose();
      if (material) material.dispose();
      if (renderer) {
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
        renderer.dispose();
      }
    };
  }, [onScrollProgress]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
      style={{ minHeight: '620px', pointerEvents: 'none' }}
    >
      {webGLError && (
        <div className="relative w-[340px] h-[480px] flex items-center justify-center">
          <img
            src="/img/hero-portrait.png"
            alt="Ankit Raj Maurya"
            className="w-full h-full object-cover filter contrast-125 grayscale"
            style={{
              maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 95%)',
              WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, black 40%, transparent 95%)',
            }}
          />
        </div>
      )}
    </div>
  );
}
