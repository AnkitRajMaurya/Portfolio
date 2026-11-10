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
  const [webGLError, setWebGLError] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Wait until the hero frame has a real layout size before creating the
    // WebGL canvas; a zero-height parent produces an invisible renderer.
    const initialWidth = container.clientWidth;
    const initialHeight = container.clientHeight;

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
          // Directional wind: outward and upward dispersion
          vec3 wind = vec3(
            (aRandomSeed.x - 0.5) * 450.0 + (pos.x * 0.6),
            (aRandomSeed.y * 0.7 + 0.3) * 600.0,
            (aRandomSeed.z - 0.5) * 500.0
          );

          vec3 drift = vec3(
            sin(uTime + aRandomSeed.z * 6.283) * 34.0,
            cos(uTime * 0.8 + aRandomSeed.x * 6.283) * 28.0,
            sin(uTime * 0.7 + aRandomSeed.y * 6.283) * 24.0
          );
          pos += (wind + drift) * ease * uDisplacement;
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
      const width = initialWidth || 780;
      const height = initialHeight || 560;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
      camera.position.z = width < 768 ? 520 : 700;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));

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
    img.src = '/img/hero-portrait.webp';

    img.onload = () => {
      try {
        const sampleCanvas = document.createElement('canvas');
        const ctx = sampleCanvas.getContext('2d');
        if (!ctx) return;

        const targetW = window.innerWidth < 768 ? 112 : 160;
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

        // Preserve the source portrait's natural proportions while sizing it
        // for the hero composition.
        const scaleX = window.innerWidth < 768 ? 2.35 : 2.2;
        const scaleY = window.innerWidth < 768 ? 2.6 : 2.45;
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

            const posX = (x - targetW / 2) * scaleX;
            const posY = -(y - centerY) * scaleY;
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

        // GSAP ScrollTrigger timeline to scrub the particle dispersion across 5 states
        scrollTriggerInstance = ScrollTrigger.create({
          trigger: '#hero-stage',
          start: 'top top',
          end: 'bottom+=300 top',
          scrub: 1.0,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const progress = self.progress;
            uniforms.uProgress.value = progress;
            if (onScrollProgress) {
              onScrollProgress(progress);
            }
          },
          onRefresh: (self) => {
            uniforms.uProgress.value = self.progress;
          },
        });

        // The portrait image finishes loading after the initial page layout.
        // Refresh the pinned trigger now so its first-frame position and
        // dissolve progress are correct before the user scrolls.
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          scrollTriggerInstance?.update();
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
      camera.position.z = newW < 768 ? 520 : 700;
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
      className={`particle-portrait-canvas ${className}`}
      style={{ pointerEvents: 'none' }}
    >
      <img
        className="portrait-fallback-image"
        src="/img/hero-portrait.webp"
        alt=""
        aria-hidden="true"
        style={{ opacity: webGLError ? 0.82 : 0 }}
      />
    </div>
  );
}
