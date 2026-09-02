"use client";

import { useEffect, useRef } from "react";
import { useMotionValue, useSpring } from "motion/react";

/*
 * Dithered bitmap sky. fbm noise forms the clouds, an ordered Bayer 4x4
 * threshold quantizes the scene like a 1-bit bitmap, and the canvas renders
 * at half resolution, upscaled pixelated for chunky grain. Raw WebGL, no
 * deps; motion.dev springs drive pointer parallax via a uniform.
 */

const VERT = `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t;
uniform vec2 ptr;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}
float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  vec2 uv = gl_FragCoord.xy / res;
  float asp = res.x / res.y;
  vec2 p = vec2(uv.x * asp, uv.y);
  p += ptr * 0.08;

  float f = fbm(p * 2.6 + vec2(-t * 0.012, t * 0.003));
  float detail = fbm(p * 6.5 + vec2(t * 0.005, -t * 0.002) + 11.3);
  float cloud = smoothstep(0.545, 0.69, f + detail * 0.24);
  float wisp = smoothstep(0.62, 0.74, fbm(p * 3.2 + vec2(-t * 0.007, t * 0.002) + 3.7));

  vec3 skyTop = vec3(0.13, 0.27, 0.74);
  vec3 skyBot = vec3(0.36, 0.51, 0.88);
  vec3 col = mix(skyBot, skyTop, uv.y);
  col = mix(col, vec3(1.0), cloud * 0.92);
  col = mix(col, vec3(1.0), wisp * 0.22);

  float d = bayer4(gl_FragCoord.xy) - 0.5;
  col = floor(col * 5.0 + 0.5 + d) / 5.0;

  gl_FragColor = vec4(col, 1.0);
}
`;

export function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 30, damping: 14, mass: 1.1 });
  const sy = useSpring(my, { stiffness: 30, damping: 14, mass: 1.1 });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "res");
    const uTime = gl.getUniformLocation(prog, "t");
    const uPtr = gl.getUniformLocation(prog, "ptr");

    const SCALE = 2; // fine bitmap grain
    const resize = () => {
      canvas.width = Math.max(2, Math.floor(window.innerWidth / SCALE));
      canvas.height = Math.max(2, Math.floor(window.innerHeight / SCALE));
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("pointermove", onMove);

    let raf = 0;
    const start = performance.now();
    const frame = () => {
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uPtr, sx.get(), sy.get());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, [mx, my, sx, sy]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 h-full w-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}
