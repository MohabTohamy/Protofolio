'use client';
import { useEffect } from 'react';
import * as THREE from 'three';

// ── Simulation resolution ──────────────────────────────────────────────────
const SIM = 512;

// ── Tuning ────────────────────────────────────────────────────────────────
// Lower = smaller / weaker circles spreading from the mouse
const STROKE_WIDTH = 2.0;   // px —  width of the line drawn by the cursor
const MOUSE_STRENGTH = 20;    // multiplier on mouse speed → wave depth (was 45)
const WAVE_INJECTION = 0.25;  // how much disturbance feeds into the wave sim (was 0.5)
const WAVE_DAMPING = 0.962; // 0.99 = long-lived rings, 0.90 = die quickly (was 0.975)

// ── Shared vertex shader (maps plane to clip space) ────────────────────────
const quadVert = /* glsl */`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// ── Display vertex shader — scroll-aware: samples only the visible window ──
// uvOffset = (0, scrollY/pageH), uvScale = (1, viewportH/pageH)
const displayVert = /* glsl */`
uniform vec2 uvOffset;
uniform vec2 uvScale;
varying vec2 vUv;
void main() {
  vUv = uvOffset + uv * uvScale;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// ── Draw a line-segment disturbance into the sim texture ───────────────────
// Produces a thin streak (not a circle) following cursor direction
const disturbFrag = /* glsl */`
uniform vec2  p0;       // previous mouse (UV)
uniform vec2  p1;       // current  mouse (UV)
uniform float radius;   // half-width of streak in UV space
uniform float strength;
varying vec2  vUv;

float lineDist(vec2 p, vec2 a, vec2 b) {
  vec2 ab  = b - a;
  float l2 = dot(ab, ab);
  if (l2 < 1e-7) return length(p - a);
  float t  = clamp(dot(p - a, ab) / l2, 0.0, 1.0);
  return length(p - (a + ab * t));
}

void main() {
  float d  = lineDist(vUv, p0, p1);
  float f  = 1.0 - smoothstep(0.0, radius, d);
  gl_FragColor = vec4(f * strength, 0.0, 0.0, 1.0);
}`;

// ── 2-D wave equation (R = height@t, G = height@t-1) ──────────────────────
const waveFrag = /* glsl */`
uniform sampler2D tWave;
uniform sampler2D tDisturb;
uniform vec2      res;
varying vec2      vUv;

void main() {
  vec2  px  = 1.0 / res;
  float l   = texture2D(tWave, vUv + vec2(-px.x,  0.0 )).r;
  float r   = texture2D(tWave, vUv + vec2( px.x,  0.0 )).r;
  float up  = texture2D(tWave, vUv + vec2( 0.0,   px.y)).r;
  float dn  = texture2D(tWave, vUv + vec2( 0.0,  -px.y)).r;
  vec2  self = texture2D(tWave, vUv).rg;
  float curr = self.r;
  float prev = self.g;

  // classic wave propagation: next = 2*avg_neighbors - prev, then damp
  float next = (l + r + up + dn) * 0.5 - prev;
  next *= ${WAVE_DAMPING};                              // damping
  next -= texture2D(tDisturb, vUv).r * ${WAVE_INJECTION}; // inject disturbance
  gl_FragColor = vec4(clamp(next, -1.0, 1.0), curr, 0.0, 1.0);
}`;

// ── Display: height-field → prismatic / iridescent caustics ───────────────
const displayFrag = /* glsl */`
uniform sampler2D tWave;
uniform vec2      res;
varying vec2      vUv;

void main() {
  vec2  px  = 2.0 / res;
  float l   = texture2D(tWave, vUv + vec2(-px.x,  0.0 )).r;
  float r   = texture2D(tWave, vUv + vec2( px.x,  0.0 )).r;
  float up  = texture2D(tWave, vUv + vec2( 0.0,   px.y)).r;
  float dn  = texture2D(tWave, vUv + vec2( 0.0,  -px.y)).r;

  vec3  normal = normalize(vec3(l - r, dn - up, 0.06));
  vec3  light  = normalize(vec3(0.55, 0.3, 0.85));
  float diff   = max(dot(normal, light), 0.0);
  vec3  half_  = normalize(light + vec3(0.0, 0.0, 1.0));
  float NdotH  = max(dot(normal, half_), 0.0);

  // Broad specular envelope — controls where color appears
  float spec   = pow(NdotH, 40.0);
  // Tight white core glint
  float glint  = pow(NdotH, 280.0);

  float h    = texture2D(tWave, vUv).r;

  // ── Thin-film / prismatic iridescence ─────────────────────────────────
  // Each RGB channel constructively interferes at a different wave height,
  // just like light splitting through glass or oil on water.
  // phase drives how quickly colours cycle as the surface ripples.
  float phase  = h * 22.0 + (normal.x - normal.y) * 8.0;
  vec3  iri;
  iri.r = 0.5 + 0.5 * cos(phase);
  iri.g = 0.5 + 0.5 * cos(phase + 2.094);  // 120° — green
  iri.b = 0.5 + 0.5 * cos(phase + 4.189);  // 240° — blue/violet

  // Combine: dark water body + prismatic caustic band + white core
  vec3  col  = diff  * vec3(0.02, 0.03, 0.07)   // near-black deep water
             + spec  * iri * 1.3                 // rainbow caustic
             + glint * vec3(1.0, 0.98, 0.95);   // bright white-silver core

  float a    = min(abs(h) * 5.5 + spec * 1.8 + glint * 2.2, 0.92);
  gl_FragColor = vec4(col, a);
}`;

// ── Component ──────────────────────────────────────────────────────────────
// Canvas is appended directly to document.body so no React parent
// (stacking contexts, transforms, backdrop-filter) can break position:fixed.
export default function LiquidBackground() {
    useEffect(() => {
        const canvas = document.createElement('canvas');
        Object.assign(canvas.style, {
            position: 'fixed',
            inset: '0',
            width: '100%',
            height: '100%',
            display: 'block',
            pointerEvents: 'none',
            zIndex: '1',
            mixBlendMode: 'screen',
        });
        document.body.appendChild(canvas);

        let W = window.innerWidth;
        let H = window.innerHeight;

        // renderer
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
        renderer.setSize(W, H);
        renderer.setPixelRatio(1);
        renderer.autoClear = false;

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const geo = new THREE.PlaneGeometry(2, 2);

        // render targets (HalfFloat = wide browser support)
        const rtOpts: THREE.RenderTargetOptions = {
            type: THREE.HalfFloatType,
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            depthBuffer: false,
        };
        let rtA = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts); // wave ping
        let rtB = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts); // wave pong
        const rtDist = new THREE.WebGLRenderTarget(SIM, SIM, rtOpts); // disturb

        // materials
        const disturbMat = new THREE.ShaderMaterial({
            uniforms: {
                p0: { value: new THREE.Vector2(0.5, 0.5) },
                p1: { value: new THREE.Vector2(0.5, 0.5) },
                radius: { value: STROKE_WIDTH / SIM }, // streak width in UV space
                strength: { value: 0.0 },
            },
            vertexShader: quadVert,
            fragmentShader: disturbFrag,
        });

        const waveMat = new THREE.ShaderMaterial({
            uniforms: {
                tWave: { value: null },
                tDisturb: { value: null },
                res: { value: new THREE.Vector2(SIM, SIM) },
            },
            vertexShader: quadVert,
            fragmentShader: waveFrag,
        });

        const displayMat = new THREE.ShaderMaterial({
            uniforms: {
                tWave: { value: null },
                res: { value: new THREE.Vector2(W, H) },
                uvOffset: { value: new THREE.Vector2(0, 0) },
                uvScale: { value: new THREE.Vector2(1, 1) },
            },
            vertexShader: displayVert,
            fragmentShader: displayFrag,
            transparent: true,
        });

        // scenes (one mesh each)
        const mkScene = (mat: THREE.Material) => {
            const s = new THREE.Scene();
            s.add(new THREE.Mesh(geo, mat));
            return s;
        };
        const disturbScene = mkScene(disturbMat);
        const waveScene = mkScene(waveMat);
        const displayScene = mkScene(displayMat);

        // mouse tracking
        const prev = new THREE.Vector2(0.5, 0.5);
        const curr = new THREE.Vector2(0.5, 0.5);
        let moved = false;

        const onMove = (e: MouseEvent) => {
            prev.copy(curr);
            // viewport-only UV — scroll has no effect
            curr.set(e.clientX / W, 1 - e.clientY / H);
            moved = true;
        };
        window.addEventListener('mousemove', onMove);

        // render loop
        let raf: number;
        function frame() {
            raf = requestAnimationFrame(frame);

            // 1 ── draw line-segment disturbance into rtDist
            const speed = moved ? prev.distanceTo(curr) : 0;
            disturbMat.uniforms.p0.value.copy(prev);
            disturbMat.uniforms.p1.value.copy(curr);
            disturbMat.uniforms.strength.value = Math.min(speed * MOUSE_STRENGTH, 1.0);
            renderer.setRenderTarget(rtDist);
            renderer.clear();
            renderer.render(disturbScene, camera);

            // 2 ── propagate wave: rtA (read) → rtB (write)
            waveMat.uniforms.tWave.value = rtA.texture;
            waveMat.uniforms.tDisturb.value = rtDist.texture;
            renderer.setRenderTarget(rtB);
            renderer.clear();
            renderer.render(waveScene, camera);
            [rtA, rtB] = [rtB, rtA];          // swap ping-pong

            // 3 ── display to screen
            displayMat.uniforms.tWave.value = rtA.texture;
            renderer.setRenderTarget(null);
            renderer.clear();
            renderer.render(displayScene, camera);

            prev.copy(curr);
            moved = false;
        }
        frame();

        const onResize = () => {
            W = window.innerWidth;
            H = window.innerHeight;
            renderer.setSize(W, H);
            displayMat.uniforms.res.value.set(W, H);
        };
        window.addEventListener('resize', onResize);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('resize', onResize);
            renderer.dispose();
            rtA.dispose();
            rtB.dispose();
            rtDist.dispose();
            canvas.remove();
        };
    }, []);

    return null;
}
