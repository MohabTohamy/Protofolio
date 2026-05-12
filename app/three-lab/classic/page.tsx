'use client';

import { Suspense, useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { ArrowLeft, ArrowUpRight, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import Link from 'next/link';
import Lenis from 'lenis';
import { Eyebrow } from '@/components/UI';

// ─── Shared scene state ───────────────────────────────────────────────────────
// Module-level refs — bypass React state churn for the 3D scene.
const scrollProgressRef = { current: 0 };
const impactTimeRef     = { current: -1 };  // when sun "lands" (clock seconds)
const hasImpactedRef    = { current: false };

// ─── Spacetime fabric shaders ─────────────────────────────────────────────────

const FABRIC_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uImpactTime;     // when the sun landed (-1 = not yet)
  uniform vec3  uMasses[4];      // (x, strength, z) per mass

  varying float vDepth;
  varying vec3  vPos;

  // Static gravitational well at a mass position
  float well(vec3 m, vec2 wp) {
    float d = length(wp - vec2(m.x, m.z));
    return m.y * exp(-d * d * 0.045);
  }

  // Expanding ripple wave emanating from impact point (origin) over time
  float ripple(vec2 wp, float impactTime, float now) {
    if (impactTime < 0.0) return 0.0;
    float age = now - impactTime;
    float d = length(wp);
    float waveFront = age * 5.5;            // wave speed
    float distFromFront = d - waveFront;
    float pulse = exp(-distFromFront * distFromFront * 0.45);
    float decay = exp(-age * 0.55);
    // Three rolling waves spawned just after impact for a "concert" feel
    float pulse2 = exp(-(d - max(0.0, age - 1.4) * 5.5) * (d - max(0.0, age - 1.4) * 5.5) * 0.5) * exp(-(age - 1.4) * 0.55) * step(1.4, age);
    float pulse3 = exp(-(d - max(0.0, age - 2.8) * 5.5) * (d - max(0.0, age - 2.8) * 5.5) * 0.5) * exp(-(age - 2.8) * 0.55) * step(2.8, age);
    return (pulse * decay + pulse2 * 0.7 + pulse3 * 0.45) * 1.2;
  }

  void main() {
    vec3 pos = position;

    // Wells from all 4 masses
    float depth =
        well(uMasses[0], pos.xz)
      + well(uMasses[1], pos.xz)
      + well(uMasses[2], pos.xz)
      + well(uMasses[3], pos.xz);

    // Impact ripples
    depth += ripple(pos.xz, uImpactTime, uTime);

    // Always-on ambient gravitational waves
    depth += sin(length(pos.xz) * 0.45 - uTime * 0.5) * 0.05;

    pos.y -= depth;
    vDepth = depth;
    vPos = pos;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const FABRIC_FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uColorFar;
  uniform vec3 uColorDeep;

  varying float vDepth;
  varying vec3  vPos;

  void main() {
    vec3 col = mix(uColorFar, uColorDeep, smoothstep(0.0, 3.0, vDepth));
    float brightness = 0.85 + smoothstep(0.0, 2.5, vDepth) * 0.7;
    float distFade = 1.0 - smoothstep(14.0, 22.0, length(vPos.xz));
    gl_FragColor = vec4(col * brightness, distFade);
  }
`;

// ─── Plasma sun shader (multi-octave noise for surface granulation) ──────────

const SUN_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SUN_FRAG = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform float uTime;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
      f.y
    );
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * vnoise(p);
      p *= 2.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = vUv * 6.0;
    float n = fbm(p + vec2(uTime * 0.13, uTime * 0.07));
    n = mix(n, fbm(p * 2.0 - uTime * 0.05), 0.4);

    vec3 cool = vec3(0.62, 0.16, 0.02);   // sunspots
    vec3 mid  = vec3(1.00, 0.52, 0.10);   // base orange
    vec3 hot  = vec3(1.00, 0.95, 0.50);   // bright flares

    vec3 col = mix(cool, mid, smoothstep(0.28, 0.58, n));
    col = mix(col, hot, smoothstep(0.66, 0.92, n));

    // Subtle limb darkening at edges (real suns dim toward the rim)
    float limb = pow(1.0 - max(0.0, vNormal.z), 1.6) * 0.25;
    col = max(col - vec3(limb), vec3(0.0));

    gl_FragColor = vec4(col * 1.3, 1.0);
  }
`;

interface Mass {
    pos: THREE.Vector2;
    baseStrength: number;
    color: string;
    radius: number;
    orbitRadius: number;
    orbitSpeed: number;
    phase: number;
}

// ─── easing helpers ───────────────────────────────────────────────────────────

const easeOutCubic   = (x: number) => 1 - Math.pow(1 - x, 3);
const easeOutBack    = (x: number) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const easeOutBounce  = (x: number) => {
    const n1 = 7.5625, d1 = 2.75;
    if (x < 1 / d1) return n1 * x * x;
    if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
    if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
};

// ─── Scene ────────────────────────────────────────────────────────────────────

function SpacetimeScene() {
    const massesRef = useRef<Mass[]>([
        // Sun (mass 0): plasma shader, no flat color
        { pos: new THREE.Vector2(0, 0),  baseStrength: 3.6, color: '#FF8030', radius: 0.95, orbitRadius: 0,  orbitSpeed: 0,    phase: 0    },
        // Earth-like — deep ocean blue with land
        { pos: new THREE.Vector2(5, 0),  baseStrength: 0.85, color: '#3B6CD9', radius: 0.36, orbitRadius: 5,  orbitSpeed: 0.40, phase: 0    },
        // Mars-like — rust red
        { pos: new THREE.Vector2(-4, 3), baseStrength: 0.7,  color: '#B0432A', radius: 0.30, orbitRadius: 7,  orbitSpeed: 0.25, phase: 2.1  },
        // Saturn-like — pale gold
        { pos: new THREE.Vector2(2, -5), baseStrength: 0.8,  color: '#D4A368', radius: 0.45, orbitRadius: 9,  orbitSpeed: 0.15, phase: 4.2  },
    ]);

    const fabricMatRef = useRef<THREE.ShaderMaterial>(null);
    const sunMatRef    = useRef<THREE.ShaderMaterial>(null);
    const bodyRefs     = useRef<(THREE.Group | null)[]>([]);
    const lightRefs    = useRef<(THREE.PointLight | null)[]>([]);
    const sunGlowRef   = useRef<THREE.Mesh>(null);

    const sunUniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

    const uniforms = useMemo(
        () => ({
            uTime:       { value: 0 },
            uImpactTime: { value: -1 },
            uMasses:     {
                value: [
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, 0, 0),
                ],
            },
            uColorFar:  { value: new THREE.Color('#dfe9ef') },  // near-white grid (flat space)
            uColorDeep: { value: new THREE.Color('#FFA040') },  // warm orange near deep wells
        }),
        []
    );

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        const p = scrollProgressRef.current;
        const masses = massesRef.current;

        // ── Sun: damped trampoline bounce ─────────────────────────────────
        // Keyframed motion: BIG drop → high rebound → smaller drop → small
        // rebound → settles FLYING HIGH above the fabric.
        // Strength tracks position: deep when sun is low, light when sun is up.
        // smoothstep interpolation between keyframes = no velocity jumps.
        const sunPath = [
            // Sun NEVER goes below y=1.2 (always above the wireframe).
            // The "drops" mean: sun comes close to fabric AND the well deepens
            // dramatically below it — strength does the heavy lifting.
            { p: 0.00, y: 8.0, s: 0.0 },  // sky, no well
            { p: 0.18, y: 1.3, s: 5.5 },  // BIG drop — sun close to fabric, deepest well below
            { p: 0.36, y: 4.0, s: 1.0 },  // bounce HIGH — well shallows
            { p: 0.55, y: 1.8, s: 3.8 },  // smaller drop, medium-deep well
            { p: 0.72, y: 3.5, s: 1.6 },  // small bounce
            { p: 1.00, y: 2.5, s: 4.2 },  // FINAL: sun hovers above, deep well funnels down
        ];

        let sunY = sunPath[0].y;
        let sunStrength = sunPath[0].s;
        for (let i = 0; i < sunPath.length - 1; i++) {
            if (p <= sunPath[i + 1].p) {
                const a = sunPath[i], b = sunPath[i + 1];
                const tt = (p - a.p) / (b.p - a.p);
                const eased = tt * tt * (3 - 2 * tt); // smoothstep
                sunY = THREE.MathUtils.lerp(a.y, b.y, eased);
                sunStrength = THREE.MathUtils.lerp(a.s, b.s, eased);
                break;
            }
        }
        if (p >= 1) {
            sunY = sunPath[sunPath.length - 1].y;
            sunStrength = sunPath[sunPath.length - 1].s;
        }

        masses[0].baseStrength = sunStrength;

        // Fire impact ripple at the bottom of the first big drop
        if (!hasImpactedRef.current && p > 0.16) {
            hasImpactedRef.current = true;
            impactTimeRef.current = t;
            uniforms.uImpactTime.value = t;
        }
        if (hasImpactedRef.current && p < 0.04) {
            hasImpactedRef.current = false;
            uniforms.uImpactTime.value = -1;
        }

        const sunBody = bodyRefs.current[0];
        if (sunBody) {
            sunBody.position.set(0, sunY, 0);
            const impactPulse = hasImpactedRef.current
                ? 1 + Math.exp(-(t - impactTimeRef.current) * 3.5) * 0.18
                : 1;
            sunBody.scale.setScalar(impactPulse);
        }

        const sunLight = lightRefs.current[0];
        if (sunLight) {
            sunLight.position.set(0, sunY + 0.5, 0);
            sunLight.intensity = THREE.MathUtils.lerp(0.4, 4.0, sunStrength / 5);
        }

        if (sunGlowRef.current) {
            sunGlowRef.current.position.set(0, sunY, 0);
            const glowScale = 1.6 + Math.sin(t * 1.2) * 0.12;
            const glowVis = THREE.MathUtils.clamp(sunStrength / 5 + 0.25, 0, 1);
            sunGlowRef.current.scale.setScalar(glowScale * glowVis);
            (sunGlowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.18 * glowVis;
        }

        uniforms.uMasses.value[0].set(0, masses[0].baseStrength, 0);

        // ── Planets: orbit at depression edge on the fabric (like screenshot)
        // Activation ramps in as scroll progresses; final orbital radius is
        // close to nominal base (not clustered tight, not pushed far out).
        const planetActivation = easeOutCubic(THREE.MathUtils.clamp((p - 0.5) / 0.5, 0, 1));
        const radiusFactor = THREE.MathUtils.lerp(1.6, 0.95, easeOutCubic(p)); // 1.6x → 0.95x

        for (let i = 1; i < masses.length; i++) {
            const m = masses[i];
            const breath = Math.sin(p * Math.PI * 1.5 + i * 1.2) * 0.18;
            const r = m.orbitRadius * (radiusFactor + breath);

            m.pos.x = Math.cos(t * m.orbitSpeed + m.phase) * r;
            m.pos.y = Math.sin(t * m.orbitSpeed + m.phase) * r;

            const body = bodyRefs.current[i];
            if (body) {
                const bob = Math.sin(t * 1.5 + i) * 0.08;
                body.position.set(m.pos.x, m.radius * 0.6 + bob, m.pos.y);
                body.scale.setScalar(planetActivation);
                body.rotation.y = t * 0.8;
            }
            const light = lightRefs.current[i];
            if (light) {
                light.position.set(m.pos.x, 1.2, m.pos.y);
                light.intensity = 1.2 * planetActivation;
            }

            uniforms.uMasses.value[i].set(m.pos.x, m.baseStrength * planetActivation, m.pos.y);
        }

        if (fabricMatRef.current) fabricMatRef.current.uniforms.uTime.value = t;
        if (sunMatRef.current)    sunMatRef.current.uniforms.uTime.value    = t;
    });

    return (
        <>
            <Stars radius={80} depth={50} count={2200} factor={3.5} saturation={0} fade speed={0.2} />

            {/* Spacetime fabric */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                <planeGeometry args={[40, 40, 100, 100]} />
                <shaderMaterial
                    ref={fabricMatRef}
                    vertexShader={FABRIC_VERT}
                    fragmentShader={FABRIC_FRAG}
                    uniforms={uniforms}
                    wireframe
                    transparent
                    depthWrite={false}
                />
            </mesh>

            {/* Sun atmospheric glow (additive halo around the sun) */}
            <mesh ref={sunGlowRef}>
                <sphereGeometry args={[1.4, 32, 32]} />
                <meshBasicMaterial
                    color="#FF7020"
                    transparent
                    opacity={0.18}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                />
            </mesh>

            {/* All 4 bodies */}
            {massesRef.current.map((m, i) => (
                <group key={i} ref={(el) => { bodyRefs.current[i] = el; }}>
                    <mesh>
                        <sphereGeometry args={[m.radius, i === 0 ? 64 : 32, i === 0 ? 64 : 32]} />
                        {i === 0 ? (
                            <shaderMaterial
                                ref={sunMatRef}
                                vertexShader={SUN_VERT}
                                fragmentShader={SUN_FRAG}
                                uniforms={sunUniforms}
                                toneMapped={false}
                            />
                        ) : (
                            <meshStandardMaterial
                                color={m.color}
                                emissive={m.color}
                                emissiveIntensity={0.4}
                                metalness={0.05}
                                roughness={0.85}
                            />
                        )}
                    </mesh>
                    <pointLight
                        ref={(el) => { lightRefs.current[i] = el; }}
                        color={i === 0 ? '#FF9540' : m.color}
                        intensity={i === 0 ? 2.5 : 1.2}
                        distance={i === 0 ? 18 : 8}
                        decay={2}
                    />
                </group>
            ))}

            <ambientLight intensity={0.12} />
        </>
    );
}

// ─── Cinematic camera (continuous, scroll-driven) ─────────────────────────────

function ScrollCamera() {
    const { camera } = useThree();
    const lookTarget = useMemo(() => new THREE.Vector3(0, 0, 0), []);

    useFrame(() => {
        const p = scrollProgressRef.current;

        // SINGLE continuous path — no phase boundaries to jump between.
        // Final pose matches the classic "spacetime curvature" 3/4 reference:
        // low side angle looking down into the depression.
        const easedP = 0.5 - 0.5 * Math.cos(p * Math.PI);

        // Slight horizontal sweep — small angle change, ends slightly off-axis
        const angle = THREE.MathUtils.lerp(0.1, 0.35, easedP);
        // Gentle pull-back
        const radius = THREE.MathUtils.lerp(11, 14, easedP);
        // Drop low to the fabric for the dramatic 3/4 view at the end
        const height = THREE.MathUtils.lerp(9, 3.5, easedP);

        camera.position.set(
            Math.sin(angle) * radius,
            height,
            Math.cos(angle) * radius
        );

        // Look DOWN into the well at the end (negative y)
        const lookY = THREE.MathUtils.lerp(0.5, -1.5, easedP);
        lookTarget.set(0, lookY, 0);
        camera.lookAt(lookTarget);
    });

    return null;
}

// ─── DepthCard — zoom-in entrance ─────────────────────────────────────────────

function DepthCard({ children, align = 'right' }: { children: React.ReactNode; align?: 'left' | 'right' | 'center' }) {
    const justify =
        align === 'left'   ? 'justify-start' :
        align === 'center' ? 'justify-center' :
                              'justify-end';

    // h-[150vh] — taller sections give more scroll pixels per progress unit,
    // making every animation feel ~50% longer / slower / more cinematic.
    return (
        <div className={`h-[150vh] flex items-center px-6 md:px-16 ${justify}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.45, filter: 'blur(18px)', y: 60 }}
                whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-sm pointer-events-auto"
            >
                {children}
            </motion.div>
        </div>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ThreeLabClassicPage() {
    const [isPlaying, setIsPlaying] = useState(false);
    const lenisRef = useRef<Lenis | null>(null);
    const autoScrollAnimRef = useRef<number | null>(null);

    // ── Initialize Lenis + scroll-progress tracking ─────────────────────────
    // Read progress directly from window.scrollY (Lenis updates this natively
    // when smooth-scrolling). Decouples scene animation from Lenis's event API.
    useEffect(() => {
        const updateProgress = () => {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            scrollProgressRef.current = max > 0
                ? Math.min(1, Math.max(0, window.scrollY / max))
                : 0;
        };
        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();

        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.5,
        });
        lenisRef.current = lenis;

        let rafId = 0;
        const raf = (time: number) => {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        };
        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
            lenisRef.current = null;
            window.removeEventListener('scroll', updateProgress);
        };
    }, []);

    // ── Auto-scroll via Lenis.scrollTo ──────────────────────────────────────
    const stopAutoScroll = () => {
        // Lenis exposes .stop() which interrupts an in-flight scrollTo
        lenisRef.current?.stop();
        lenisRef.current?.start();
        if (autoScrollAnimRef.current) {
            clearTimeout(autoScrollAnimRef.current);
            autoScrollAnimRef.current = null;
        }
        setIsPlaying(false);
    };

    const toggleAutoScroll = () => {
        const lenis = lenisRef.current;
        if (!lenis) return;

        if (isPlaying) {
            stopAutoScroll();
            return;
        }

        // If at bottom, restart from top
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (window.scrollY >= max - 4) {
            lenis.scrollTo(0, { immediate: true });
        }

        const duration = 12; // seconds — brisk but cinematic
        setIsPlaying(true);

        // Start scrolling toward bottom
        lenis.scrollTo(max, {
            duration,
            easing: (t) => 0.5 - 0.5 * Math.cos(t * Math.PI), // ease-in-out
            onComplete: () => {
                autoScrollAnimRef.current = null;
                setIsPlaying(false);
            },
        });

        // Backup timeout in case onComplete doesn't fire
        autoScrollAnimRef.current = window.setTimeout(() => {
            setIsPlaying(false);
            autoScrollAnimRef.current = null;
        }, (duration + 1) * 1000);
    };

    useEffect(() => () => stopAutoScroll(), []);

    return (
        <div className="min-h-screen relative bg-[var(--bg)]">
            {/* Top bar */}
            <div className="fixed top-16 left-0 right-0 z-40 px-6 flex items-center justify-between bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--hairline)] h-12">
                <Link
                    href="/three-lab"
                    className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    3D Lab
                </Link>
                <p className="hidden md:block text-xs uppercase tracking-[0.18em] text-[var(--fg)]/50">
                    04 / 04 — Spacetime
                </p>
                <button
                    onClick={toggleAutoScroll}
                    className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
                >
                    {isPlaying ? (
                        <>
                            <Square className="w-3 h-3 fill-[var(--accent)] text-[var(--accent)]" />
                            <span className="text-[var(--accent)]">Stop</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            Auto-scroll
                        </>
                    )}
                </button>
            </div>

            {/* Hero */}
            <section className="min-h-screen flex items-center px-6 pt-28">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">Scroll-driven 3D · spacetime curvature</Eyebrow>
                    <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-8">
                        Mass tells space how to curve.
                    </h1>
                    <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl mb-12">
                        Einstein's general relativity, rendered in real time. Watch the sun
                        fall, hit the fabric, send out ripples — planets orbit and breathe.
                        Hit auto-scroll to play it as a film.
                    </p>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--fg)]/40 animate-pulse">
                        <span>Scroll</span>
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                            <path d="M5 0v14M1 9l4 5 4-5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Scroll-driven scene */}
            <div className="relative">
                <div className="sticky top-0 h-screen w-full z-0">
                    <Canvas
                        camera={{ position: [0, 11, 8], fov: 55 }}
                        dpr={[1, 1.5]}
                        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
                        onCreated={({ gl }) => { gl.setClearColor(new THREE.Color('#08070A')); }}
                    >
                        <Suspense fallback={null}>
                            <SpacetimeScene />
                            <ScrollCamera />
                            <EffectComposer multisampling={0}>
                                <Bloom intensity={0.4} luminanceThreshold={0.4} luminanceSmoothing={0.4} />
                                <Vignette eskil={false} offset={0.18} darkness={0.7} />
                            </EffectComposer>
                        </Suspense>
                    </Canvas>
                </div>

                {/* Cards */}
                <div className="relative z-10 pointer-events-none">

                    <DepthCard align="right">
                        <div className="card-editorial p-6 bg-[var(--bg)]/70 backdrop-blur-sm">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                01 — descent
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                Heavy body, falling.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                The sun starts eight units above the fabric and descends with an
                                ease-out bounce. Its gravitational strength ramps in lockstep —
                                strong before contact, devastating on impact.
                            </p>
                        </div>
                    </DepthCard>

                    <DepthCard align="left">
                        <div className="card-editorial p-6 bg-[var(--bg)]/70 backdrop-blur-sm">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                02 — impact
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                Three rolling waves.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                When the sun hits, the vertex shader spawns three Gaussian ripples
                                that race outward at 5.5 units/sec. Each one decays exponentially.
                                The fabric remembers the moment.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {['gaussian ripples', 'glsl', 'vertex displacement'].map((t) => (
                                    <span key={t} className="font-mono text-[10px] px-2 py-0.5 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </DepthCard>

                    <DepthCard align="center">
                        <Link href="/three-lab/particle-ring" className="group block">
                            <div className="card-editorial p-8 bg-[var(--bg)]/70 backdrop-blur-sm hover:border-[var(--accent)] transition-colors">
                                <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                    aside · 02 / 04
                                </p>
                                <h3 className="font-display text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-3 leading-tight">
                                    Particle Ring
                                </h3>
                                <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">
                                    Six thousand GPU particles, three rings, four orbiting planets —
                                    displaced by your cursor through a custom GLSL shader.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </DepthCard>

                    <DepthCard align="right">
                        <div className="card-editorial p-6 bg-[var(--bg)]/70 backdrop-blur-sm">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                03 — orbit
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                Three planets, breathing.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                The orbiting bodies spiral inward as the sun stabilizes — their
                                radii pulse with phase-offset sine waves. Each one carves its own
                                moving well across the fabric.
                            </p>
                            <div className="space-y-2 text-xs font-mono">
                                {[
                                    { label: 'fabric segments', val: '100 × 100' },
                                    { label: 'masses tracked',  val: '4' },
                                    { label: 'falloff',         val: 'exp(−d² · 0.045)' },
                                    { label: 'wave speed',      val: '5.5 u/sec' },
                                ].map((r) => (
                                    <div key={r.label} className="flex justify-between">
                                        <span className="text-[var(--fg-dim)]">{r.label}</span>
                                        <span className="text-[var(--fg)]/60">{r.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </DepthCard>

                    <DepthCard align="center">
                        <Link href="/three-lab/futuristic-dashboard" className="group block">
                            <div className="card-editorial p-8 bg-[var(--bg)]/70 backdrop-blur-sm hover:border-[var(--accent)] transition-colors">
                                <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                    aside · 03 / 04
                                </p>
                                <h3 className="font-display text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-3 leading-tight">
                                    Holographic Field
                                </h3>
                                <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">
                                    Distortion shaders, floating geometry, environment maps.
                                    Hover spheres, click cubes — every primitive has a state.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </DepthCard>

                    <div className="h-[150vh] flex items-center justify-center px-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.45, filter: 'blur(18px)', y: 60 }}
                            whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
                            viewport={{ once: false, amount: 0.3 }}
                            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                            className="max-w-2xl pointer-events-auto text-center"
                        >
                            <Eyebrow className="mb-6">Settled</Eyebrow>
                            <h3 className="font-display text-4xl md:text-5xl text-[var(--fg)] mb-6 leading-tight">
                                The system stabilizes.
                            </h3>
                            <p className="text-[var(--fg-muted)] leading-relaxed mb-8">
                                The sun rests in its well. Planets orbit on stable paths. The
                                fabric continues to ripple — gravitational waves never stop.
                                Built with Three.js, R3F, custom GLSL, Lenis, and Framer Motion.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['three.js', 'r3f', 'glsl', 'lenis', 'framer-motion'].map((t) => (
                                    <span key={t} className="font-mono text-xs px-3 py-1 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
