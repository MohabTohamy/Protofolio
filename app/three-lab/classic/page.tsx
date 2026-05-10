'use client';

import { Suspense, useRef, useEffect } from 'react';
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

export default function ThreeLabClassicPage() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const section1Ref = useRef<HTMLDivElement>(null);
    const section2Ref = useRef<HTMLDivElement>(null);
    const section3Ref = useRef<HTMLDivElement>(null);
    const section4Ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
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
                    <Eyebrow className="mb-6">
                        Scroll-driven 3D · gsap scrolltrigger
                    </Eyebrow>
                    <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-8">
                        A camera that moves with you.
                    </h1>
                    <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl mb-12">
                        Four scroll-triggered scenes. The same WebGL cube,
                        choreographed across rotation, scale, position, and
                        camera depth — all driven by your scrollbar.
                    </p>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[var(--fg)]/40 animate-pulse">
                        <span>Scroll</span>
                        <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                            <path d="M5 0v14M1 9l4 5 4-5" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                    </div>
                </div>
            </section>

            {/* Scroll-driven 3D experience */}
            <div className="relative">
                {/* Sticky canvas */}
                <div ref={canvasRef} className="sticky top-0 h-screen w-full">
                    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.4} />
                            <spotLight
                                position={[10, 10, 10]}
                                angle={0.3}
                                penumbra={1}
                                intensity={1}
                            />
                            <pointLight
                                position={[-10, -10, -10]}
                                intensity={0.4}
                                color="#E8704F"
                            />
                            <ScrollScene
                                section1Ref={section1Ref}
                                section2Ref={section2Ref}
                                section3Ref={section3Ref}
                                section4Ref={section4Ref}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Scroll content */}
                <div className="relative pointer-events-none">
                    {/* Section 1 */}
                    <div
                        ref={section1Ref}
                        className="h-screen flex items-center justify-end px-6 md:px-16"
                    >
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                01 — birth
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                The cube enters.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                                Scale tweens from 0.1 to 1 across this section.
                                Rotation ramps to a quarter turn on X and Y.
                                Smooth-scrubbed against the scroll position.
                            </p>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div
                        ref={section2Ref}
                        className="h-screen flex items-center justify-start px-6 md:px-16"
                    >
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                02 — drift
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                It rotates and translates.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                Two full rotations on each axis, position offsets
                                to (2, 1), and a scale pulse to 1.5×. All
                                interpolated against scroll velocity.
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                                {['rotation', 'translation', 'scale'].map((t) => (
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
                                    Six thousand GPU particles on three concentric
                                    rings, displaced by your cursor through a
                                    custom GLSL shader.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Section 3 — Pavement */}
                    <div
                        ref={section3Ref}
                        className="h-screen flex items-center justify-end px-6 md:px-16"
                    >
                        <div className="max-w-sm pointer-events-auto card-editorial p-6">
                            <p className="font-mono text-xs text-[var(--fg-dim)] uppercase tracking-wider mb-3">
                                03 — domain
                            </p>
                            <h3 className="font-display text-3xl text-[var(--fg)] mb-3 leading-tight">
                                Pavement structure.
                            </h3>
                            <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-4">
                                The four layers of a flexible pavement, in
                                cross-section. Surface, base, subbase, subgrade.
                            </p>
                            <div className="space-y-1.5">
                                {[
                                    { label: 'Asphalt', color: '#1f2937', detail: '5–10 cm' },
                                    { label: 'Base', color: '#a16207', detail: '15–30 cm' },
                                    { label: 'Subbase', color: '#d97706', detail: '20–40 cm' },
                                    { label: 'Subgrade', color: '#9a3412', detail: 'natural soil' },
                                ].map((l) => (
                                    <div
                                        key={l.label}
                                        className="flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-sm"
                                                style={{ background: l.color }}
                                            />
                                            <span className="text-[var(--fg)]">
                                                {l.label}
                                            </span>
                                        </div>
                                        <span className="font-mono text-[var(--fg-dim)]">
                                            {l.detail}
                                        </span>
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
                                    environment maps. Hover the spheres, click the
                                    cubes — every interaction has a state.
                                </p>
                                <span className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                                    Open
                                    <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                </span>
                            </div>
                        </Link>
                    </div>

                    {/* Section 4 */}
                    <div
                        ref={section4Ref}
                        className="h-screen flex items-center justify-center px-6"
                    >
                        <div className="max-w-2xl pointer-events-auto text-center">
                            <Eyebrow className="mb-6">Stack</Eyebrow>
                            <h3 className="font-display text-4xl md:text-5xl text-[var(--fg)] mb-6 leading-tight">
                                Camera pulls back. Scene resets.
                            </h3>
                            <p className="text-[var(--fg-muted)] leading-relaxed mb-8">
                                Built with Three.js, React Three Fiber, and GSAP
                                ScrollTrigger. Every keyframe is scrubbed
                                bidirectionally — scroll up undoes everything in
                                reverse.
                            </p>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {[
                                    'three.js',
                                    'r3f',
                                    'gsap',
                                    'scrolltrigger',
                                    'webgl',
                                ].map((t) => (
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

            {/* Static rotating-cube fallback below */}
            <section className="px-6 py-24 border-t border-[var(--hairline)]">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">Aside · static viewer</Eyebrow>
                    <h2 className="font-display text-3xl md:text-4xl text-[var(--fg)] mb-8 leading-tight">
                        For comparison: the same primitive, no scroll choreography.
                    </h2>
                    <div className="aspect-video rounded-xl overflow-hidden border border-[var(--hairline)] bg-[var(--bg-card)]">
                        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                            <Suspense fallback={null}>
                                <ambientLight intensity={0.5} />
                                <spotLight
                                    position={[10, 10, 10]}
                                    angle={0.15}
                                    penumbra={1}
                                />
                                <pointLight
                                    position={[-10, -10, -10]}
                                    color="#E8704F"
                                />
                                <RotatingCube />
                                <OrbitControls />
                            </Suspense>
                        </Canvas>
                    </div>
                    <p className="text-sm text-[var(--fg-muted)] mt-4">
                        Drag to orbit. Scroll inside to zoom.
                    </p>
                </div>
            </section>
        </div>
    );
}

// ─── Scroll Scene ────────────────────────────────────────────────────────────

interface ScrollSceneProps {
    section1Ref: React.RefObject<HTMLDivElement | null>;
    section2Ref: React.RefObject<HTMLDivElement | null>;
    section3Ref: React.RefObject<HTMLDivElement | null>;
    section4Ref: React.RefObject<HTMLDivElement | null>;
}

function ScrollScene({
    section1Ref,
    section2Ref,
    section3Ref,
    section4Ref,
}: ScrollSceneProps) {
    const cubeRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (!cubeRef.current) return;
        const cube = cubeRef.current;

        if (section1Ref.current) {
            gsap.fromTo(
                cube.rotation,
                { x: 0, y: 0, z: 0 },
                {
                    x: Math.PI * 0.5,
                    y: Math.PI * 0.5,
                    scrollTrigger: {
                        trigger: section1Ref.current,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1,
                    },
                }
            );
            gsap.fromTo(
                cube.scale,
                { x: 0.1, y: 0.1, z: 0.1 },
                {
                    x: 1,
                    y: 1,
                    z: 1,
                    scrollTrigger: {
                        trigger: section1Ref.current,
                        start: 'top center',
                        end: 'center center',
                        scrub: 1,
                    },
                }
            );
        }

        if (section2Ref.current) {
            gsap.to(cube.rotation, {
                x: Math.PI * 2,
                y: Math.PI * 2,
                z: Math.PI * 0.5,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
            });
            gsap.to(cube.position, {
                x: 2,
                y: 1,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
            gsap.to(cube.scale, {
                x: 1.5,
                y: 1.5,
                z: 1.5,
                scrollTrigger: {
                    trigger: section2Ref.current,
                    start: 'top center',
                    end: 'center center',
                    scrub: 1,
                },
            });
        }

        if (section3Ref.current) {
            gsap.to(cube.scale, {
                x: 0.1,
                y: 0.1,
                z: 0.1,
                scrollTrigger: {
                    trigger: section3Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
            gsap.to(cube.position, {
                x: 0,
                y: 0,
                scrollTrigger: {
                    trigger: section3Ref.current,
                    start: 'top center',
                    end: 'bottom center',
                    scrub: 1,
                },
            });
        }

        if (section4Ref.current) {
            gsap.to(camera.position, {
                z: 12,
                y: 5,
                scrollTrigger: {
                    trigger: section4Ref.current,
                    start: 'top center',
                    end: 'center center',
                    scrub: 1,
                },
            });
            gsap.to(cube.rotation, {
                x: Math.PI * 3,
                y: Math.PI * 3,
                scrollTrigger: {
                    trigger: section4Ref.current,
                    start: 'top center',
                    end: 'bottom center',
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
            <mesh ref={cubeRef}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial
                    color="#E8704F"
                    metalness={0.4}
                    roughness={0.3}
                />
            </mesh>
            <gridHelper
                args={[20, 20, '#3a352b', '#1f1d18']}
                position={[0, -3, 0]}
            />
        </>
    );
}

function RotatingCube() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.7;
        }
    });
    return (
        <mesh ref={meshRef} rotation={[0.5, 0.5, 0]}>
            <boxGeometry args={[2, 2, 2]} />
            <meshStandardMaterial
                color="#E8704F"
                metalness={0.5}
                roughness={0.25}
            />
        </mesh>
    );
}
