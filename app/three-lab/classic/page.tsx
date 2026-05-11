'use client';

import { Suspense, useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Link from 'next/link';
import { Eyebrow } from '@/components/UI';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// ─── Background dust ──────────────────────────────────────────────────────────

function DustField() {
    const ref = useRef<THREE.Points>(null);
    const geo = useMemo(() => {
        const positions = new Float32Array(1200 * 3);
        for (let i = 0; i < 1200; i++) {
            positions[i * 3 + 0] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 40;
        }
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return g;
    }, []);

    useFrame((_, delta) => {
        if (ref.current) ref.current.rotation.y += delta * 0.015;
    });

    return (
        <points ref={ref} geometry={geo}>
            <pointsMaterial size={0.04} color="#A39D8F" transparent opacity={0.35} sizeAttenuation />
        </points>
    );
}

// ─── Orbiting satellites ──────────────────────────────────────────────────────

interface SatProps {
    radius: number;
    speed: number;
    size: number;
    color: string;
    phase: number;
    tilt?: number;
}

function Satellite({ radius, speed, size, color, phase, tilt = 0 }: SatProps) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        if (groupRef.current) groupRef.current.rotation.y = t * speed + phase;
        if (meshRef.current) meshRef.current.rotation.x += 0.02;
    });

    return (
        <group rotation={[tilt, 0, 0]}>
            <group ref={groupRef}>
                <mesh ref={meshRef} position={[radius, 0, 0]}>
                    <sphereGeometry args={[size, 24, 24]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.55}
                        metalness={0.6}
                        roughness={0.3}
                        toneMapped={false}
                    />
                </mesh>
            </group>
        </group>
    );
}

// ─── Scroll scene ─────────────────────────────────────────────────────────────

interface ScrollSceneProps {
    section1Ref: React.RefObject<HTMLDivElement | null>;
    section2Ref: React.RefObject<HTMLDivElement | null>;
    section3Ref: React.RefObject<HTMLDivElement | null>;
    section4Ref: React.RefObject<HTMLDivElement | null>;
}

function ScrollScene({ section1Ref, section2Ref, section3Ref, section4Ref }: ScrollSceneProps) {
    const knotRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const matRef = useRef<THREE.MeshStandardMaterial>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (!knotRef.current || !groupRef.current || !matRef.current) return;
        const knot = knotRef.current;
        const group = groupRef.current;
        const mat = matRef.current;

        // Hard-set initial state (prevents fromTo conflicts on re-trigger)
        gsap.set(knot.scale, { x: 0.02, y: 0.02, z: 0.02 });
        gsap.set(knot.rotation, { x: 0, y: 0, z: 0 });
        gsap.set(group.position, { x: 0, y: 0, z: 0 });
        gsap.set(camera.position, { x: 0, y: 0, z: 8 });

        // Section 1 — Birth: scale from tiny to full
        if (section1Ref.current) {
            gsap.to(knot.scale, {
                x: 1, y: 1, z: 1,
                scrollTrigger: {
                    trigger: section1Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1.5,
                },
            });
            gsap.to(knot.rotation, {
                x: Math.PI * 0.4,
                y: Math.PI * 0.8,
                scrollTrigger: {
                    trigger: section1Ref.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }

        // Section 2 — Explore: full rotation + drift right
        if (section2Ref.current) {
            gsap.to(knot.rotation, {
                y: Math.PI * 3,
                z: Math.PI * 0.5,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
            gsap.to(group.position, {
                x: 2.5,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
            gsap.to(mat, {
                emissiveIntensity: 1.2,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
        }

        // Section 3 — Real-time: camera zooms in, object re-centers
        if (section3Ref.current) {
            gsap.to(group.position, {
                x: 0, y: 0,
                scrollTrigger: {
                    trigger: section3Ref.current,
                    start: 'top center',
                    end: 'center center',
                    scrub: 1,
                },
            });
            gsap.to(camera.position, {
                z: 5,
                scrollTrigger: {
                    trigger: section3Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
            gsap.to(knot.rotation, {
                x: Math.PI * 2,
                scrollTrigger: {
                    trigger: section3Ref.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }

        // Section 4 — Pullback: camera retreats to reveal full scene
        if (section4Ref.current) {
            gsap.to(camera.position, {
                z: 16,
                y: 4,
                scrollTrigger: {
                    trigger: section4Ref.current,
                    start: 'top center',
                    end: 'center center',
                    scrub: 1,
                },
            });
            gsap.to(mat, {
                emissiveIntensity: 0.4,
                scrollTrigger: {
                    trigger: section4Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
            gsap.to(knot.rotation, {
                y: Math.PI * 6,
                scrollTrigger: {
                    trigger: section4Ref.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, [section1Ref, section2Ref, section3Ref, section4Ref, camera]);

    return (
        <>
            <DustField />
            <group ref={groupRef} position={[0, 0, 0]}>
                {/* Orbiting satellites */}
                <Satellite radius={3.5} speed={0.7}  size={0.18} color="#E8704F" phase={0}    tilt={0.4} />
                <Satellite radius={4.5} speed={0.45} size={0.22} color="#7AC4D9" phase={2.09} tilt={-0.6} />
                <Satellite radius={3.0} speed={1.1}  size={0.14} color="#B89BD9" phase={4.19} tilt={0.9} />

                {/* Hero torus knot */}
                <mesh ref={knotRef} scale={0.02}>
                    <torusKnotGeometry args={[1.2, 0.38, 220, 36]} />
                    <meshStandardMaterial
                        ref={matRef}
                        color="#E8704F"
                        emissive="#E8704F"
                        emissiveIntensity={0.4}
                        metalness={0.5}
                        roughness={0.2}
                    />
                </mesh>
            </group>
        </>
    );
}

// ─── Static viewer knot ───────────────────────────────────────────────────────

function RotatingKnot() {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (ref.current) {
            ref.current.rotation.x += delta * 0.4;
            ref.current.rotation.y += delta * 0.6;
        }
    });
    return (
        <mesh ref={ref}>
            <torusKnotGeometry args={[1.2, 0.38, 220, 36]} />
            <meshStandardMaterial
                color="#E8704F"
                emissive="#E8704F"
                emissiveIntensity={0.3}
                metalness={0.5}
                roughness={0.2}
            />
        </mesh>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ThreeLabClassicPage() {
    const section1Ref = useRef<HTMLDivElement>(null);
    const section2Ref = useRef<HTMLDivElement>(null);
    const section3Ref = useRef<HTMLDivElement>(null);
    const section4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            ScrollTrigger.getAll().forEach((t) => t.kill());
        };
    }, []);

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
                    04 / 04 — Scroll Scene
                </p>
                <div />
            </div>

            {/* Hero */}
            <section className="min-h-screen flex items-center px-6 pt-28">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">Scroll-driven 3D · gsap scrolltrigger</Eyebrow>
                    <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-8">
                        A camera that moves with you.
                    </h1>
                    <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl mb-12">
                        Four scroll-triggered acts. A torus knot births, orbits,
                        fills the frame, then the camera retreats — scrubbed
                        against your scrollbar, bidirectionally.
                    </p>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--fg)]/40 animate-pulse">
                        <span>Scroll</span>
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                            <path d="M5 0v14M1 9l4 5 4-5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Scroll-driven section */}
            <div className="relative">
                {/* Sticky canvas */}
                <div className="sticky top-0 h-screen w-full z-0">
                    <Canvas camera={{ position: [0, 0, 8], fov: 50 }} dpr={[1, 1.5]}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.3} />
                            <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1.2} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7AC4D9" />
                            <ScrollScene
                                section1Ref={section1Ref}
                                section2Ref={section2Ref}
                                section3Ref={section3Ref}
                                section4Ref={section4Ref}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Cards — z-10 ensures they paint above the WebGL canvas layer */}
                <div className="relative z-10 pointer-events-none">
                    {/* Section 1 — Birth */}
                    <div ref={section1Ref} className="h-screen flex items-center justify-end px-6 md:px-16">
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                01 — birth
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                The shape enters.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                A (2, 3) torus knot — 220 tube segments, 36 radial
                                divisions — scales from 2% to full size. Three
                                satellites orbit it from the first frame.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 — Explore */}
                    <div ref={section2Ref} className="h-screen flex items-center justify-start px-6 md:px-16">
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                02 — explore
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                It rotates and drifts.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                Three full Y-rotations. Position offsets right.
                                Emissive intensity ramps — the material responds
                                to scroll velocity in real time.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {['rotation', 'translation', 'emissive'].map((t) => (
                                    <span
                                        key={t}
                                        className="font-mono text-[10px] px-2 py-0.5 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Particle Ring promo */}
                    <div className="h-screen flex items-center justify-center px-6">
                        <Link
                            href="/three-lab/particle-ring"
                            className="pointer-events-auto group block max-w-md"
                        >
                            <div className="card-editorial p-8 hover:border-[var(--accent)] transition-colors">
                                <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                    aside · 02 / 04
                                </p>
                                <h3 className="font-display text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-3 leading-tight">
                                    Particle Ring
                                </h3>
                                <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">
                                    Six thousand GPU particles, three rings, four
                                    orbiting planets — displaced by your cursor
                                    through a custom GLSL shader.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Section 3 — Real-time */}
                    <div ref={section3Ref} className="h-screen flex items-center justify-end px-6 md:px-16">
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                03 — real-time
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                Camera zooms in.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                Distance cuts from 8 to 5. PBR material up close —
                                metalness 0.5, roughness 0.2 — responding to
                                the scene lights in real time.
                            </p>
                            <div className="space-y-2 text-xs font-mono">
                                {[
                                    { label: 'geometry', val: 'TorusKnotGeometry' },
                                    { label: 'segments', val: '220 × 36' },
                                    { label: 'material', val: 'MeshStandard PBR' },
                                    { label: 'renderer', val: 'WebGL 2' },
                                ].map((r) => (
                                    <div key={r.label} className="flex justify-between">
                                        <span className="text-[var(--fg-dim)]">{r.label}</span>
                                        <span className="text-[var(--fg)]/60">{r.val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Holographic field promo */}
                    <div className="h-screen flex items-center justify-center px-6">
                        <Link
                            href="/three-lab/futuristic-dashboard"
                            className="pointer-events-auto group block max-w-md"
                        >
                            <div className="card-editorial p-8 hover:border-[var(--accent)] transition-colors">
                                <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                    aside · 03 / 04
                                </p>
                                <h3 className="font-display text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors mb-3 leading-tight">
                                    Holographic Field
                                </h3>
                                <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">
                                    Distortion shaders, floating geometry,
                                    environment maps. Hover spheres, click cubes —
                                    every primitive has a state.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Section 4 — Stack */}
                    <div ref={section4Ref} className="h-screen flex items-center justify-center px-6">
                        <div className="max-w-2xl pointer-events-auto text-center">
                            <Eyebrow className="mb-6">Stack</Eyebrow>
                            <h3 className="font-display text-4xl md:text-5xl text-[var(--fg)] mb-6 leading-tight">
                                Camera pulls back. Full scene.
                            </h3>
                            <p className="text-[var(--fg-muted)] leading-relaxed mb-8">
                                Built with Three.js, React Three Fiber, and GSAP
                                ScrollTrigger. Every keyframe scrubs
                                bidirectionally — scroll up undoes everything in
                                reverse.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {['three.js', 'r3f', 'gsap', 'scrolltrigger', 'webgl'].map((t) => (
                                    <span
                                        key={t}
                                        className="font-mono text-xs px-3 py-1 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]"
                                    >
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static viewer */}
            <section className="px-6 py-24 border-t border-[var(--hairline)]">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">Static viewer</Eyebrow>
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--fg)] mb-8 leading-tight">
                        Same primitive, no choreography.
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-[var(--hairline)] bg-[var(--bg-card)]">
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                            <Suspense fallback={null}>
                                <ambientLight intensity={0.4} />
                                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                                <pointLight position={[-10, -10, -10]} color="#7AC4D9" intensity={0.6} />
                                <RotatingKnot />
                                <OrbitControls enablePan={false} />
                            </Suspense>
                        </Canvas>
                    </div>
                    <p className="text-sm text-[var(--fg-muted)] mt-4">
                        Drag to orbit. Scroll to zoom.
                    </p>
                </div>
            </section>
        </div>
    );
}
