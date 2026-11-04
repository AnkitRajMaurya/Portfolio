'use client';

import React, { useEffect, useRef } from 'react';

export default function BackgroundShader() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = c.getContext('webgl', { antialias: false, alpha: false });
    } catch {}
    if (!gl) return;

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function sh(t: number, s: string) {
      if (!gl) return null;
      const o = gl.createShader(t);
      if (!o) return null;
      gl.shaderSource(o, s);
      gl.compileShader(o);
      return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null;
    }

    const vs = sh(
      gl.VERTEX_SHADER,
      'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}'
    );

    const fs = sh(
      gl.FRAGMENT_SHADER,
      'precision mediump float;uniform vec2 r,m;uniform float t;' +
        'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
        'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}' +
        'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(p);p*=2.;a*=.5;}return v;}' +
        'void main(){vec2 u=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;vec2 mp=(m-.5)*vec2(r.x/r.y,1.);' +
        'vec2 q=vec2(fbm(p*2.+t*.06),fbm(p*2.+vec2(5.2,1.3)-t*.05));' +
        'float f=fbm(p*2.2+q*2.4+mp*.5+t*.03);float d=length(p-mp);' +
        'vec3 col=mix(vec3(.043,.039,.035),vec3(1.,.36,.12),smoothstep(.5,1.,f)*.5);' +
        'col+=vec3(1.,.42,.15)*.1/(d*2.8+.35);col*=mix(.55,1.,u.y*.6+.4);gl_FragColor=vec4(col,1.);}'
    );

    if (!vs || !fs) return;

    const pr = gl.createProgram();
    if (!pr) return;
    gl.attachShader(pr, vs);
    gl.attachShader(pr, fs);
    gl.linkProgram(pr);
    gl.useProgram(pr);

    const bf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );

    const al = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(al);
    gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);

    const ur = gl.getUniformLocation(pr, 'r');
    const um = gl.getUniformLocation(pr, 'm');
    const ut = gl.getUniformLocation(pr, 't');

    function size() {
      if (!c || !gl) return;
      c.width = Math.max(2, Math.floor(window.innerWidth * 0.5));
      c.height = Math.max(2, Math.floor(window.innerHeight * 0.5));
      gl.viewport(0, 0, c.width, c.height);
    }
    size();
    window.addEventListener('resize', size);

    let mx = 0.5,
      my = 0.5,
      tx = 0.5,
      ty = 0.5;
    const t0 = performance.now();
    let animId = 0;

    const handlePointerMove = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth;
      ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', handlePointerMove);

    function draw(now: number) {
      if (!gl || !c) return;
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      gl.uniform2f(ur, c.width, c.height);
      gl.uniform2f(um, mx, my);
      gl.uniform1f(ut, (now - t0) / 1000);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function loop(now: number) {
      if (!document.hidden) draw(now);
      animId = requestAnimationFrame(loop);
    }

    if (still) {
      draw(t0 + 4000);
    } else {
      animId = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', size);
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return <canvas id="gl" ref={canvasRef} aria-hidden="true" suppressHydrationWarning />;
}
