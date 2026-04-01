'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ─── GLSL shaders (inlined) ─────────────────────────────────────────────────

const BG_VERTEX = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const BG_FRAGMENT = `
  varying vec2 vUv;

  uniform vec3  uBackgroundColor;
  uniform vec3  uBlob1Color;
  uniform vec3  uBlob2Color;
  uniform float uNoiseStrength;
  uniform float uBlobRadius;
  uniform float uBlobRadiusSecondary;
  uniform float uBlobStrength;
  uniform float uTime;
  uniform float uVelocityIntensity;

  float random(vec2 c) {
    return fract(sin(dot(c, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    vec3 color = uBackgroundColor;
    float t = uTime * 0.00028;
    vec2 b1 = vec2(
      0.50 + sin(t * 1.000) * 0.13 + sin(t * 1.618) * 0.05,
      0.48 + cos(t * 0.794) * 0.09 + cos(t * 1.272) * 0.03
    );
    vec2 b2 = vec2(
      0.35 + cos(t * 0.927) * 0.11 + cos(t * 1.414) * 0.04,
      0.55 + sin(t * 1.175) * 0.07 + sin(t * 0.618) * 0.03
    );
    float blob1 = smoothstep(uBlobRadius,          0.0, distance(vUv, b1));
    float blob2 = smoothstep(uBlobRadiusSecondary, 0.0, distance(vUv, b2));
    vec3 s1 = mix(uBlob1Color, uBackgroundColor, 0.35);
    vec3 s2 = mix(uBlob2Color, uBackgroundColor, 0.35);
    color = mix(color, s1, blob1 * uBlobStrength);
    color = mix(color, s2, blob2 * uBlobStrength);
    color += uVelocityIntensity * 0.10;
    float grain = random(vUv * vec2(1387.13, 947.91)) - 0.5;
    color += grain * uNoiseStrength;
    color  = clamp(color, 0.0, 1.0);
    gl_FragColor = vec4(color, 1.0);
  }
`;

// ─── Gallery data ────────────────────────────────────────────────────────────

const GALLERY_DATA = [
    {
        color: '#6366f1',
        backgroundColor: '#06061a',
        blob1Color: '#312e81',
        blob2Color: '#0891b2',
        position: { x: -0.8, y: 0 },
        label: { word: 'Ball Pit', sub: 'Physics Simulation', textColor: '#c7d2fe' },
        href: '/three-lab/ballpit',
    },
    {
        color: '#0ea5e9',
        backgroundColor: '#03111f',
        blob1Color: '#0369a1',
        blob2Color: '#6d28d9',
        position: { x: 0.8, y: 0 },
        label: { word: 'Particle Ring', sub: 'Interactive Orbits', textColor: '#bae6fd' },
        href: '/three-lab/particle-ring',
    },
    {
        color: '#a855f7',
        backgroundColor: '#0d0318',
        blob1Color: '#6b21a8',
        blob2Color: '#db2777',
        position: { x: -0.5, y: 0 },
        label: { word: 'Dashboard', sub: 'Holographic 3D', textColor: '#e9d5ff' },
        href: '/three-lab/futuristic-dashboard',
    },
] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function ThreeLabPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const labelRef = useRef<HTMLDivElement>(null);
    const hrefRef = useRef<string>('');
    const router = useRouter();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Renderer
        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.autoClear = false;

        // Camera + scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
        camera.position.set(0, 0, 6);

        // Background quad
        const bgScene = new THREE.Scene();
        const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const bgMaterial = new THREE.ShaderMaterial({
            vertexShader: BG_VERTEX,
            fragmentShader: BG_FRAGMENT,
            depthWrite: false,
            depthTest: false,
            uniforms: {
                uBackgroundColor: { value: new THREE.Color(GALLERY_DATA[0].backgroundColor) },
                uBlob1Color: { value: new THREE.Color(GALLERY_DATA[0].blob1Color) },
                uBlob2Color: { value: new THREE.Color(GALLERY_DATA[0].blob2Color) },
                uNoiseStrength: { value: 0.04 },
                uBlobRadius: { value: 0.65 },
                uBlobRadiusSecondary: { value: 0.65 * 0.78 },
                uBlobStrength: { value: 0.9 },
                uTime: { value: 0 },
                uVelocityIntensity: { value: 0 },
            },
        });
        bgScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bgMaterial));

        // Planes
        const PLANE_GAP = 5;
        const planeGeo = new THREE.PlaneGeometry(3, 3);
        const planes: THREE.Mesh[] = [];

        GALLERY_DATA.forEach((entry, i) => {
            const mat = new THREE.MeshBasicMaterial({
                color: new THREE.Color(entry.color),
                side: THREE.DoubleSide,
                transparent: true,
                depthWrite: false,
                opacity: i === 0 ? 1 : 0,
            });
            const mesh = new THREE.Mesh(planeGeo, mat);
            mesh.position.set(entry.position.x, entry.position.y, -i * PLANE_GAP);
            mesh.userData.basePosition = entry.position;
            scene.add(mesh);
            planes.push(mesh);
        });

        // Scroll
        let scrollTarget = 0;
        let scrollCurrent = 0;
        let prevScroll = 0;
        let velocity = 0;

        const SCROLL_SMOOTH = 0.08;
        const SCROLL_TO_WORLD = 0.01;
        const VEL_DAMP = 0.12;
        const VEL_MAX = 1.5;

        const maxCamZ = 5;
        const minCamZ = -(planes.length - 1) * PLANE_GAP + 5;
        const startCamZ = maxCamZ;
        camera.position.z = startCamZ;

        const camZFromScroll = (s: number) => startCamZ - s * SCROLL_TO_WORLD;
        const scrollFromCamZ = (z: number) => (startCamZ - z) / SCROLL_TO_WORLD;

        const clampScroll = () => {
            const lo = scrollFromCamZ(maxCamZ);
            const hi = scrollFromCamZ(minCamZ);
            scrollTarget = THREE.MathUtils.clamp(scrollTarget, lo, hi);
            scrollCurrent = THREE.MathUtils.clamp(scrollCurrent, lo, hi);
        };

        let touchY = 0;
        const normWheel = (e: WheelEvent) => e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
        const onWheel = (e: WheelEvent) => { e.preventDefault(); scrollTarget += normWheel(e); clampScroll(); };
        const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0]?.clientY ?? 0; };
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const cy = e.touches[0]?.clientY ?? touchY;
            scrollTarget += (touchY - cy) * 1.8;
            clampScroll();
            touchY = cy;
        };

        canvas.addEventListener('wheel', onWheel, { passive: false });
        canvas.addEventListener('touchstart', onTouchStart, { passive: true });
        canvas.addEventListener('touchmove', onTouchMove, { passive: false });

        // Click to navigate
        const onClick = () => { if (hrefRef.current) router.push(hrefRef.current); };
        canvas.addEventListener('click', onClick);

        // Pointer parallax
        const ptrTarget = new THREE.Vector2(0, 0);
        const ptrCurrent = new THREE.Vector2(0, 0);
        const onPtrMove = (e: PointerEvent) => ptrTarget.set(
            (e.clientX / window.innerWidth) * 2 - 1,
            -((e.clientY / window.innerHeight) * 2 - 1),
        );
        const onPtrLeave = () => ptrTarget.set(0, 0);
        window.addEventListener('pointermove', onPtrMove, { passive: true });
        window.addEventListener('pointerleave', onPtrLeave, { passive: true });

        let breath = 0, targetBreath = 0;
        let driftCurrent = 0, driftTarget = 0;

        // Mood colours
        const currBg = new THREE.Color(), currB1 = new THREE.Color(), currB2 = new THREE.Color();
        const nextBg = new THREE.Color(), nextB1 = new THREE.Color(), nextB2 = new THREE.Color();

        const moodBlend = (camZ: number) => {
            const sampled = camZ - PLANE_GAP;
            const norm = THREE.MathUtils.clamp((planes[0].position.z - sampled) / PLANE_GAP, 0, planes.length - 1);
            const idx = Math.floor(norm);
            const nextIdx = Math.min(idx + 1, planes.length - 1);
            return { idx, nextIdx, blend: norm - idx };
        };

        const updateMood = (camZ: number) => {
            const { idx, nextIdx, blend } = moodBlend(camZ);
            const c = GALLERY_DATA[idx], n = GALLERY_DATA[nextIdx];
            currBg.set(c.backgroundColor).lerp(nextBg.set(n.backgroundColor), blend);
            currB1.set(c.blob1Color).lerp(nextB1.set(n.blob1Color), blend);
            currB2.set(c.blob2Color).lerp(nextB2.set(n.blob2Color), blend);
            bgMaterial.uniforms.uBackgroundColor.value.copy(currBg);
            bgMaterial.uniforms.uBlob1Color.value.copy(currB1);
            bgMaterial.uniforms.uBlob2Color.value.copy(currB2);
        };

        const updateFade = (camZ: number) => {
            const sampled = camZ - PLANE_GAP;
            const norm = THREE.MathUtils.clamp((planes[0].position.z - sampled) / PLANE_GAP, 0, planes.length - 1);
            const idx = Math.floor(norm);
            const nextIdx = Math.min(idx + 1, planes.length - 1);
            const blend = norm - idx;
            planes.forEach((p, i) => {
                let target = 0;
                if (i === idx) target = 1 - blend;
                if (i === nextIdx) target = Math.max(target, blend);
                const mat = p.material as THREE.MeshBasicMaterial;
                mat.opacity = THREE.MathUtils.lerp(mat.opacity, target, 0.14);
            });
        };

        const getActiveIdx = (camZ: number) => {
            const norm = THREE.MathUtils.clamp((planes[0].position.z - camZ) / PLANE_GAP, 0, planes.length - 1);
            const idx = Math.floor(norm);
            const blend = norm - idx;
            return blend >= 0.5 ? Math.min(idx + 1, planes.length - 1) : idx;
        };

        // Resize
        const resize = () => {
            const w = canvas.clientWidth || window.innerWidth;
            const h = canvas.clientHeight || window.innerHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h, false);
        };
        resize();
        window.addEventListener('resize', resize);

        // DOM label refs (set once – elements already in DOM via React)
        const wordEl = labelRef.current?.querySelector<HTMLElement>('[data-word]');
        const subEl = labelRef.current?.querySelector<HTMLElement>('[data-sub]');
        const chipEl = labelRef.current?.querySelector<HTMLElement>('[data-chip]');
        const idxEl = labelRef.current?.querySelector<HTMLElement>('[data-index]');
        let prevActive = -1;

        // Animate
        let raf: number;
        let smoothDepth = 0, smoothVel = 0;

        const animate = () => {
            raf = requestAnimationFrame(animate);

            // scroll physics
            scrollCurrent = THREE.MathUtils.lerp(scrollCurrent, scrollTarget, SCROLL_SMOOTH);
            clampScroll();
            const rawVel = scrollCurrent - prevScroll;
            velocity = THREE.MathUtils.lerp(velocity, rawVel, VEL_DAMP);
            velocity = THREE.MathUtils.clamp(velocity, -VEL_MAX, VEL_MAX);
            if (Math.abs(velocity) < 0.0001) velocity = 0;
            prevScroll = scrollCurrent;

            camera.position.z = THREE.MathUtils.clamp(camZFromScroll(scrollCurrent), minCamZ, maxCamZ);

            // depth/vel smoothing
            const velInt = THREE.MathUtils.clamp(Math.abs(velocity) / VEL_MAX, 0, 1);
            const depthPrg = THREE.MathUtils.clamp((maxCamZ - camera.position.z) / (maxCamZ - minCamZ), 0, 1);
            smoothDepth = THREE.MathUtils.lerp(smoothDepth, depthPrg, 0.1);
            smoothVel = THREE.MathUtils.lerp(smoothVel, velInt, 0.1);

            // background
            const blobR = THREE.MathUtils.clamp(0.65 + smoothDepth * 0.08, 0.05, 1);
            const blobS = THREE.MathUtils.clamp(0.9 + smoothVel * 0.10, 0, 1);
            bgMaterial.uniforms.uBlobRadius.value = blobR;
            bgMaterial.uniforms.uBlobRadiusSecondary.value = blobR * 0.78;
            bgMaterial.uniforms.uBlobStrength.value = blobS;
            bgMaterial.uniforms.uTime.value = performance.now();
            bgMaterial.uniforms.uVelocityIntensity.value = smoothVel;

            updateMood(camera.position.z);
            updateFade(camera.position.z);

            // parallax + breath
            ptrCurrent.lerp(ptrTarget, 0.08);
            const velNorm = THREE.MathUtils.clamp(Math.abs(velocity) / VEL_MAX, 0, 1);
            targetBreath = THREE.MathUtils.clamp(velNorm * 1.1, 0, 1);
            breath = THREE.MathUtils.lerp(breath, targetBreath, 0.14);
            driftTarget = THREE.MathUtils.clamp(velocity / VEL_MAX, -1, 1);
            driftCurrent = THREE.MathUtils.lerp(driftCurrent, driftTarget, 0.05);

            const isMobile = window.innerWidth <= 768;
            planes.forEach((p, i) => {
                const op = (p.material as THREE.MeshBasicMaterial).opacity;
                const base = p.userData.basePosition as { x: number; y: number };
                const dep = 1 + i * 0.05;
                const par = op * dep;
                const br = breath * op;

                p.position.x = base.x + ptrCurrent.x * 0.16 * par;
                p.position.y = base.y + ptrCurrent.y * 0.08 * par + driftCurrent * 0.05;
                p.position.z = -i * PLANE_GAP;
                p.rotation.x = -ptrCurrent.y * 0.045 * br;
                p.rotation.y = ptrCurrent.x * 0.045 * br;

                const baseScale = isMobile ? 0.65 : 1.0;
                const pulse = 1 + 0.03 * br;
                p.scale.set(baseScale * pulse, baseScale * pulse, 1);
            });

            // label
            const active = getActiveIdx(camera.position.z);
            if (active !== prevActive && labelRef.current) {
                const d = GALLERY_DATA[active];
                if (wordEl) wordEl.textContent = d.label.word;
                if (subEl) subEl.textContent = d.label.sub;
                if (chipEl) chipEl.style.backgroundColor = d.color;
                if (idxEl) idxEl.textContent = String(active + 1).padStart(2, '0');
                labelRef.current.style.color = d.label.textColor;
                labelRef.current.style.opacity = '1';
                hrefRef.current = d.href;
                prevActive = active;
            }

            // draw
            renderer.clear(true, true, true);
            renderer.render(bgScene, bgCamera);
            renderer.clearDepth();
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            cancelAnimationFrame(raf);
            canvas.removeEventListener('wheel', onWheel);
            canvas.removeEventListener('touchstart', onTouchStart);
            canvas.removeEventListener('touchmove', onTouchMove);
            canvas.removeEventListener('click', onClick);
            window.removeEventListener('pointermove', onPtrMove);
            window.removeEventListener('pointerleave', onPtrLeave);
            window.removeEventListener('resize', resize);
            renderer.dispose();
            bgMaterial.dispose();
            planeGeo.dispose();
            planes.forEach(p => (p.material as THREE.MeshBasicMaterial).dispose());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {/* Canvas — fixed/full-viewport so it ignores the layout padding */}
            <canvas
                ref={canvasRef}
                style={{
                    position: 'fixed',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    display: 'block',
                    touchAction: 'none',
                    zIndex: 0,
                    cursor: 'pointer',
                }}
            />

            {/* Back link */}
            <Link
                href="/"
                className="fixed top-20 left-6 z-50 text-[10px] uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity"
                style={{ fontFamily: 'monospace', color: 'inherit' }}
            >
                ← Home
            </Link>

            {/* Compare banner */}
            <div className="fixed top-20 right-6 z-50 flex items-center gap-2" style={{ fontFamily: 'monospace' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <Link
                    href="/three-lab/classic"
                    className="text-[10px] uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
                    style={{ color: 'inherit' }}
                >
                    Classic version →
                </Link>
            </div>

            {/* Page title */}
            <p
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-[10px] uppercase tracking-widest opacity-50 whitespace-nowrap"
                style={{ fontFamily: 'monospace' }}
            >
                3D Engineering Lab
            </p>

            {/* Scroll hint */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
                <span className="text-[9px] uppercase tracking-widest opacity-50" style={{ fontFamily: 'monospace' }}>
                    Scroll to explore
                </span>
                <svg width="10" height="16" viewBox="0 0 10 16" fill="none" className="opacity-40">
                    <path d="M5 0v16M1 11l4 5 4-5" stroke="currentColor" strokeWidth="1.2" />
                </svg>
            </div>

            {/* Click hint */}
            <p
                className="fixed bottom-10 right-6 z-50 text-[9px] uppercase tracking-widest opacity-40 pointer-events-none"
                style={{ fontFamily: 'monospace' }}
            >
                Click to enter
            </p>

            {/* Label overlay — updated per-frame via DOM refs */}
            <div
                ref={labelRef}
                className="fixed inset-0 z-40 pointer-events-none transition-[opacity,color] duration-300"
                style={{ opacity: 0, fontFamily: 'monospace' }}
            >
                {/* Left: index + name + colour chip */}
                <div className="absolute left-[clamp(2.5rem,8vw,10rem)] top-1/2 flex flex-col gap-3">
                    <p data-index className="text-[9px] uppercase tracking-widest opacity-60 m-0" />
                    <p data-word className="text-[clamp(10px,1vw,14px)] uppercase tracking-[0.12em] font-semibold m-0" />
                    <span
                        data-chip
                        className="w-4 h-4 rounded-full inline-block"
                        style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.2)' }}
                    />
                </div>

                {/* Right: sub-label */}
                <div className="absolute right-[clamp(2.5rem,7vw,10rem)] top-1/2">
                    <p data-sub className="text-[clamp(9px,0.72vw,11px)] uppercase tracking-widest opacity-70 m-0" />
                </div>
            </div>
        </>
    );
}
