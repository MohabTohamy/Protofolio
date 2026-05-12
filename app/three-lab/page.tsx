'use client';

import { useRef, useState, useMemo, useEffect, memo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { pointsInner, pointsOuter } from '@/lib/particleUtils';

// ─── Data ────────────────────────────────────────────────────────────────────

const NODE_RADIUS = 11;

const PROJECTS = [
    {
        id: 'ballpit',
        index: '01',
        title: 'Ball Pit',
        description:
            'Real-time rigid-body physics. Two hundred bodies, mouse-driven forces, retunable from a control panel.',
        tech: ['three.js', 'rapier', 'webgl'],
        color: '#FF7A4F',
        angle: 0,
        href: '/three-lab/ballpit',
    },
    {
        id: 'particle',
        index: '02',
        title: 'Particle Ring',
        description:
            'Six thousand GPU particles, three concentric rings, custom GLSL shader, cursor displacement, additive bloom.',
        tech: ['r3f', 'glsl', 'postprocessing'],
        color: '#FFB347',
        angle: Math.PI / 2,
        href: '/three-lab/particle-ring',
    },
    {
        id: 'holo',
        index: '03',
        title: 'Holographic Field',
        description:
            'Distortion shaders, floating geometry, light orbs, environment maps. Twelve primitives, all interactive.',
        tech: ['r3f', 'drei', 'shaders'],
        color: '#F5DCC9',
        angle: Math.PI,
        href: '/three-lab/futuristic-dashboard',
    },
    {
        id: 'scroll',
        index: '04',
        title: 'Scroll Scene',
        description:
            'Four scroll-driven keyframes choreographed with GSAP ScrollTrigger. A camera that follows your scrollbar.',
        tech: ['gsap', 'r3f', 'webgl'],
        color: '#D9879B',
        angle: Math.PI * 1.5,
        href: '/three-lab/classic',
    },
] as const;

type Project = (typeof PROJECTS)[number];

// ─── Star field (the original sphere-based ring, warm palette) ───────────────
// memo: StarField takes no props — it must never re-render when parent state
// changes (fps ticks every 500 ms → would reconcile 3125 Instance children).

const StarField = memo(function StarField() {
    const innerRef = useRef<THREE.Group>(null);
    const outerRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        if (innerRef.current) innerRef.current.rotation.z = t * 0.04;
        if (outerRef.current) outerRef.current.rotation.z = t * 0.015;
    });

    return (
        <>
            {/* Inner dense ring — low-poly to keep vertex throughput cheap */}
            <group ref={innerRef}>
                <Instances limit={pointsInner.length + 10}>
                    <sphereGeometry args={[0.08, 5, 5]} />
                    <meshBasicMaterial toneMapped={false} />
                    {pointsInner.map((p) => (
                        <Instance key={p.idx} position={p.position} color={p.color} />
                    ))}
                </Instances>
            </group>

            {/* Outer scattered star dust */}
            <group ref={outerRef}>
                <Instances limit={pointsOuter.length + 10}>
                    <sphereGeometry args={[0.06, 4, 4]} />
                    <meshBasicMaterial toneMapped={false} />
                    {pointsOuter.map((p) => (
                        <Instance key={p.idx} position={p.position} color={p.color} />
                    ))}
                </Instances>
            </group>
        </>
    );
});

// ─── Project node ────────────────────────────────────────────────────────────

function ProjectNode({
    project,
    hovered,
    onHover,
    onUnhover,
    onClick,
}: {
    project: Project;
    hovered: boolean;
    onHover: () => void;
    onUnhover: () => void;
    onClick: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);
    // Scalar refs for manual lerping — avoids `new Vector3(...)` per frame
    const meshScaleRef = useRef(1);
    const ringScaleRef = useRef(0);
    const matRef = useRef<THREE.MeshStandardMaterial | null>(null);

    // Nodes positioned on the XY plane (same as starfield disc), z=0
    const basePos = useMemo(
        () =>
            new THREE.Vector3(
                Math.cos(project.angle) * NODE_RADIUS,
                Math.sin(project.angle) * NODE_RADIUS,
                0
            ),
        [project.angle]
    );

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        if (groupRef.current) {
            // gentle bob along Z (perpendicular to disc)
            groupRef.current.position.z =
                basePos.z + Math.sin(t * 0.6 + project.angle) * 0.35;
        }

        if (meshRef.current) {
            // Scalar lerp — no Vector3 allocation
            const target = hovered ? 1.7 : 1.0;
            meshScaleRef.current += (target - meshScaleRef.current) * 0.12;
            meshRef.current.scale.setScalar(meshScaleRef.current);

            // Cache material reference (set once)
            if (!matRef.current) {
                matRef.current = meshRef.current.material as THREE.MeshStandardMaterial;
            }
            const pulse = Math.sin(t * (hovered ? 3 : 1.5)) * 0.5 + 0.5;
            matRef.current.emissiveIntensity =
                (hovered ? 1.2 : 0.55) + pulse * (hovered ? 0.4 : 0.15);
        }

        if (ringRef.current) {
            ringRef.current.rotation.x = t * 0.4;
            ringRef.current.rotation.y = t * 0.6;
            const target = hovered ? 1.0 : 0.0;
            ringScaleRef.current += (target - ringScaleRef.current) * 0.15;
            ringRef.current.scale.setScalar(ringScaleRef.current);
        }

        if (lightRef.current) {
            const pulse = Math.sin(t * (hovered ? 3 : 1.5)) * 0.5 + 0.5;
            lightRef.current.intensity = (hovered ? 2.5 : 0.6) + pulse * 0.4;
        }
    });

    return (
        <group ref={groupRef} position={basePos.clone()}>
            {/* Halo torus — visible only on hover */}
            <mesh ref={ringRef} scale={0}>
                <torusGeometry args={[1.0, 0.02, 6, 32]} />
                <meshBasicMaterial color={project.color} transparent opacity={0.6} toneMapped={false} />
            </mesh>

            <mesh
                ref={meshRef}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    onHover();
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    onUnhover();
                    document.body.style.cursor = 'auto';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
            >
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial
                    color={project.color}
                    emissive={project.color}
                    emissiveIntensity={0.55}
                    metalness={0.4}
                    roughness={0.2}
                    toneMapped={false}
                />
            </mesh>

            <pointLight
                ref={lightRef}
                color={project.color}
                intensity={0.6}
                distance={6}
                decay={2}
            />
        </group>
    );
}

// FPS bridge — reads fps inside the R3F loop and writes directly to a DOM
// span via a ref to avoid triggering any React re-renders at all.
function FpsBridge({ spanRef }: { spanRef: React.RefObject<HTMLSpanElement | null> }) {
    const frames = useRef(0);
    const last = useRef(performance.now());
    useFrame(() => {
        frames.current++;
        const now = performance.now();
        if (now - last.current >= 500) {
            const fps = Math.round((frames.current * 1000) / (now - last.current));
            if (spanRef.current) spanRef.current.textContent = String(fps);
            frames.current = 0;
            last.current = now;
        }
    });
    return null;
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function ThreeLabPage() {
    const router = useRouter();
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const fpsSpanRef = useRef<HTMLSpanElement>(null);
    const autoHideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const hovered = useMemo(
        () => PROJECTS.find((p) => p.id === hoveredId) ?? null,
        [hoveredId]
    );

    // Auto-hide info card after 5 s of inactivity
    useEffect(() => {
        if (!hoveredId) return;
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        autoHideRef.current = setTimeout(() => setHoveredId(null), 5000);
        return () => {
            if (autoHideRef.current) clearTimeout(autoHideRef.current);
        };
    }, [hoveredId]);

    // Keyboard nav
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const idx = hoveredId
                ? PROJECTS.findIndex((p) => p.id === hoveredId)
                : -1;
            if (
                e.key === 'ArrowRight' ||
                e.key === 'ArrowDown' ||
                e.key === 'l' ||
                e.key === 'j'
            ) {
                const next = (idx + 1 + PROJECTS.length) % PROJECTS.length;
                setHoveredId(PROJECTS[next].id);
            } else if (
                e.key === 'ArrowLeft' ||
                e.key === 'ArrowUp' ||
                e.key === 'h' ||
                e.key === 'k'
            ) {
                const prev = (idx - 1 + PROJECTS.length) % PROJECTS.length;
                setHoveredId(PROJECTS[prev].id);
            } else if (e.key === 'Enter' || e.key === ' ') {
                if (hovered) {
                    e.preventDefault();
                    router.push(hovered.href);
                }
            } else if (e.key === 'Escape') {
                setHoveredId(null);
            } else if (['1', '2', '3', '4'].includes(e.key)) {
                setHoveredId(PROJECTS[Number(e.key) - 1].id);
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [hoveredId, hovered, router]);

    return (
        <div className="fixed inset-0 bg-[var(--bg)] overflow-hidden">
            <Canvas
                camera={{ position: [10, -7.5, 18], fov: 55 }}
                dpr={[1, 1.5]}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(new THREE.Color('#0E0D0B'));
                }}
            >
                <ambientLight intensity={0.4} />
                <pointLight position={[-30, 0, -30]} intensity={4} color="#FFD89B" />

                <StarField />

                {PROJECTS.map((p) => (
                    <ProjectNode
                        key={p.id}
                        project={p}
                        hovered={hoveredId === p.id}
                        onHover={() => setHoveredId(p.id)}
                        onUnhover={() =>
                            setHoveredId((cur) => (cur === p.id ? null : cur))
                        }
                        onClick={() => router.push(p.href)}
                    />
                ))}

                <FpsBridge spanRef={fpsSpanRef} />

                <OrbitControls
                    autoRotate={!hoveredId}
                    autoRotateSpeed={0.35}
                    enableZoom
                    enablePan={false}
                    enableDamping
                    dampingFactor={0.08}
                    rotateSpeed={0.6}
                    zoomSpeed={0.6}
                    minDistance={10}
                    maxDistance={32}
                />

                <EffectComposer multisampling={0}>
                    <Bloom
                        intensity={0.45}
                        luminanceThreshold={0.55}
                        luminanceSmoothing={0.4}
                    />
                    <Vignette eskil={false} offset={0.2} darkness={0.8} />
                </EffectComposer>
            </Canvas>

            {/* Top-left: back link */}
            <Link
                href="/"
                className="fixed top-20 left-6 z-50 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                </svg>
                home
            </Link>

            {/* Top-center: section title */}
            {/* <p className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/50">
                3D Lab — {PROJECTS.length} demos
            </p> */}

            {/* Top-right: interaction hint */}
            <div className="fixed top-20 right-6 z-50 hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/40">
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">drag</span>
                <span>orbit</span>
                <span className="opacity-30">·</span>
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">scroll</span>
                <span>zoom</span>
                <span className="opacity-30">·</span>
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">↵</span>
                <span>open</span>
            </div>

            {/* Idle prompt */}
            <AnimatePresence>
                {!hovered && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="fixed left-1/2 top-[28vh] -translate-x-1/2 z-30 text-center pointer-events-none px-6 max-w-xl"
                    >
                        {/* <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg)]/40 mb-4">
                            Four interactive 3D demos
                        </p>
                        <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.98] mb-4">
                            Hover a node.
                        </h1>
                        <p className="text-sm text-[var(--fg)]/50">
                            Each glowing orb is a working demo. Click to enter.
                        </p> */}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hovered project info card */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key={hovered.id}
                        initial={{ opacity: 0, x: -24, filter: 'blur(8px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -32, filter: 'blur(12px)', scale: 0.96 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 max-w-sm pointer-events-auto"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{
                                    background: hovered.color,
                                    boxShadow: `0 0 16px ${hovered.color}`,
                                }}
                            />
                            <p className="font-mono text-xs tracking-[0.18em] text-[var(--fg)]/60 uppercase">
                                {hovered.index} / {String(PROJECTS.length).padStart(2, '0')}
                            </p>
                        </div>
                        <h2 className="font-display text-4xl md:text-5xl text-[var(--fg)] leading-[0.98] mb-4">
                            {hovered.title}
                        </h2>
                        <p className="text-sm md:text-base text-[var(--fg-muted)] leading-relaxed mb-5 max-w-xs">
                            {hovered.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-6">
                            {hovered.tech.map((t) => (
                                <span
                                    key={t}
                                    className="font-mono text-[10px] uppercase tracking-wider px-2 py-1 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]"
                                >
                                    {t}
                                </span>
                            ))}
                        </div>
                        <button
                            onClick={() => router.push(hovered.href)}
                            className="inline-flex items-center gap-2 text-sm group transition-colors"
                            style={{ color: hovered.color }}
                        >
                            <span className="underline underline-offset-4 decoration-current/40 group-hover:decoration-current">
                                Open demo
                            </span>
                            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                        {/* 5 s auto-dismiss countdown */}
                        <div className="mt-5 h-px overflow-hidden bg-[var(--hairline)]">
                            <motion.div
                                key={hovered.id + '-bar'}
                                className="h-full"
                                style={{ background: hovered.color }}
                                initial={{ width: '100%' }}
                                animate={{ width: '0%' }}
                                transition={{ duration: 5, ease: 'linear' }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom-center hint */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
                {/* <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg)]/40">
                    drag to orbit · scroll to zoom · click a node to enter
                </p> */}
            </div>

            {/* Bottom-right stats */}
            <div className="fixed bottom-10 right-6 md:right-12 z-30 text-right pointer-events-none">
                <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">stars</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">
                            {(pointsInner.length + pointsOuter.length).toLocaleString()}
                        </dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">nodes</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">
                            {PROJECTS.length}
                        </dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">fps</dt>
                        <dd className="tabular-nums text-[var(--accent)] w-16">
                            <span ref={fpsSpanRef}>60</span>
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
