'use client';

import { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Data ────────────────────────────────────────────────────────────────────

const RADIUS = 7;

const PROJECTS = [
    {
        id: 'ballpit',
        index: '01',
        title: 'Ball Pit',
        description:
            'Real-time rigid-body physics. Two hundred bodies, mouse-driven forces, retunable from a control panel.',
        tech: ['three.js', 'rapier', 'webgl'],
        color: '#E8704F',
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
        color: '#E8B14F',
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
        color: '#7AC4D9',
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
        color: '#B89BD9',
        angle: Math.PI * 1.5,
        href: '/three-lab/classic',
    },
] as const;

type Project = (typeof PROJECTS)[number];

// ─── Shaders ─────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute float aOffset;
  attribute float aRing;
  attribute vec3  aSeed;

  uniform float uTime;
  uniform vec3  uTarget;
  uniform float uTargetStrength;
  uniform float uPixelRatio;

  varying float vDepth;
  varying float vRing;
  varying float vGlow;
  varying float vPull;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float ringIdx = aRing;
    float radius = 4.0 + ringIdx * 1.3 + sin(uTime * 0.4 + aOffset * 6.28318) * 0.15;
    float angle  = uTime * (0.14 + 0.05 * ringIdx) + aOffset * 6.28318;

    vec3 pos;
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;
    pos.y = sin(angle * 2.0 + aSeed.x * 6.28) * (0.3 + ringIdx * 0.22);

    // Attraction toward hovered project node
    vec3 toTarget = uTarget - pos;
    float dist = length(toTarget) + 0.0001;
    float pull = uTargetStrength * (1.0 / (1.0 + dist * 0.4)) * 0.55;
    pos += normalize(toTarget) * pull;

    pos *= 1.0 + sin(uTime * 0.6 + aSeed.y * 6.28) * 0.012;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float baseSize = mix(1.4, 2.8, hash(aOffset * 31.0));
    gl_PointSize = baseSize * uPixelRatio * (200.0 / -mvPos.z) * (0.7 + pull * 1.0);

    vDepth = -mvPos.z;
    vRing  = ringIdx;
    vGlow  = 0.4 + pull * 1.4 + hash(aOffset) * 0.3;
    vPull  = pull;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  uniform vec3 uTargetColor;
  uniform float uTargetStrength;

  varying float vDepth;
  varying float vRing;
  varying float vGlow;
  varying float vPull;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core = smoothstep(0.50, 0.00, r);
    float halo = smoothstep(0.50, 0.25, r) * 0.25;

    vec3 col = mix(uColorA, uColorB, vRing * 0.5);
    col      = mix(col, uColorC, smoothstep(0.5, 1.5, vRing));
    col      = mix(col, uTargetColor, smoothstep(0.0, 1.0, vPull * 2.0) * uTargetStrength * 0.6);
    col     *= 0.45 + vGlow * 0.5;

    float depthFade = clamp(1.0 - (vDepth - 6.0) / 30.0, 0.2, 1.0);

    float alpha = (core * 0.55 + halo) * depthFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

const RINGS = 3;
const PER_RING = 2000;
const COUNT = RINGS * PER_RING;

// ─── Scene components ───────────────────────────────────────────────────────

function ParticleField({
    targetPos,
    targetStrength,
    targetColor,
}: {
    targetPos: THREE.Vector3;
    targetStrength: number;
    targetColor: THREE.Color;
}) {
    const ptsRef = useRef<THREE.Points>(null);

    const { offsets, rings, seeds, positions } = useMemo(() => {
        const positions = new Float32Array(COUNT * 3);
        const offsets = new Float32Array(COUNT);
        const rings = new Float32Array(COUNT);
        const seeds = new Float32Array(COUNT * 3);
        for (let i = 0; i < COUNT; i++) {
            offsets[i] = Math.random();
            rings[i] = Math.floor(i / PER_RING);
            seeds[i * 3 + 0] = Math.random();
            seeds[i * 3 + 1] = Math.random();
            seeds[i * 3 + 2] = Math.random();
        }
        return { positions, offsets, rings, seeds };
    }, []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uTarget: { value: new THREE.Vector3() },
            uTargetStrength: { value: 0 },
            uTargetColor: { value: new THREE.Color('#E8704F') },
            uColorA: { value: new THREE.Color('#E8B14F') },
            uColorB: { value: new THREE.Color('#E8704F') },
            uColorC: { value: new THREE.Color('#7AC4D9') },
            uPixelRatio: {
                value:
                    typeof window !== 'undefined'
                        ? Math.min(window.devicePixelRatio, 2)
                        : 1,
            },
        }),
        []
    );

    const currentStrength = useRef(0);

    useFrame((state) => {
        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uTarget.value.lerp(targetPos, 0.08);
        currentStrength.current += (targetStrength - currentStrength.current) * 0.06;
        uniforms.uTargetStrength.value = currentStrength.current;
        uniforms.uTargetColor.value.lerp(targetColor, 0.08);

        if (ptsRef.current) ptsRef.current.rotation.y += 0.0008;
    });

    return (
        <points ref={ptsRef} frustumCulled={false}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} count={COUNT} />
                <bufferAttribute attach="attributes-aOffset" args={[offsets, 1]} count={COUNT} />
                <bufferAttribute attach="attributes-aRing" args={[rings, 1]} count={COUNT} />
                <bufferAttribute attach="attributes-aSeed" args={[seeds, 3]} count={COUNT} />
            </bufferGeometry>
            <shaderMaterial
                uniforms={uniforms}
                vertexShader={VERT}
                fragmentShader={FRAG}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

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

    const basePos = useMemo(
        () =>
            new THREE.Vector3(
                Math.cos(project.angle) * RADIUS,
                0,
                Math.sin(project.angle) * RADIUS
            ),
        [project.angle]
    );

    useFrame((state) => {
        const t = state.clock.elapsedTime;

        // Bob
        if (groupRef.current) {
            groupRef.current.position.y =
                basePos.y + Math.sin(t * 0.6 + project.angle) * 0.25;
        }

        if (meshRef.current) {
            const targetScale = hovered ? 1.7 : 1.0;
            meshRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.12
            );
            const mat = meshRef.current.material as THREE.MeshStandardMaterial;
            const pulse = Math.sin(t * (hovered ? 3 : 1.5)) * 0.5 + 0.5;
            mat.emissiveIntensity =
                (hovered ? 1.0 : 0.35) + pulse * (hovered ? 0.35 : 0.15);
        }

        if (ringRef.current) {
            const r = ringRef.current;
            r.rotation.x = t * 0.4;
            r.rotation.y = t * 0.6;
            const ringScale = hovered ? 1.0 : 0.0;
            r.scale.lerp(new THREE.Vector3(ringScale, ringScale, ringScale), 0.15);
        }

        if (lightRef.current) {
            const pulse = Math.sin(t * (hovered ? 3 : 1.5)) * 0.5 + 0.5;
            lightRef.current.intensity = (hovered ? 2.2 : 0.8) + pulse * 0.6;
        }
    });

    return (
        <group ref={groupRef} position={basePos.clone()}>
            {/* Orbiting halo ring — only visible on hover */}
            <mesh ref={ringRef} scale={0}>
                <torusGeometry args={[1.1, 0.025, 8, 64]} />
                <meshBasicMaterial color={project.color} transparent opacity={0.7} />
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
                <sphereGeometry args={[0.55, 48, 48]} />
                <meshStandardMaterial
                    color={project.color}
                    emissive={project.color}
                    emissiveIntensity={0.7}
                    metalness={0.5}
                    roughness={0.15}
                />
            </mesh>

            <pointLight
                ref={lightRef}
                color={project.color}
                intensity={2}
                distance={8}
                decay={2}
            />
        </group>
    );
}

// Slow auto-orbit camera that pauses when a node is hovered
function CameraRig({ hoveredId }: { hoveredId: string | null }) {
    const { camera } = useThree();
    const angle = useRef(0);
    const ptr = useRef(new THREE.Vector2(0, 0));
    const ptrTarget = useRef(new THREE.Vector2(0, 0));

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            ptrTarget.current.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -((e.clientY / window.innerHeight) * 2 - 1)
            );
        };
        window.addEventListener('pointermove', onMove, { passive: true });
        return () => window.removeEventListener('pointermove', onMove);
    }, []);

    useFrame((_, delta) => {
        if (!hoveredId) {
            angle.current += delta * 0.05;
        }
        ptr.current.lerp(ptrTarget.current, 0.04);

        const r = 14;
        const baseX = Math.sin(angle.current) * r;
        const baseZ = Math.cos(angle.current) * r;
        const offsetX = ptr.current.x * 1.2;
        const offsetY = 4 + ptr.current.y * 0.8;

        camera.position.lerp(
            new THREE.Vector3(baseX + offsetX, offsetY, baseZ),
            0.05
        );
        camera.lookAt(0, 0, 0);
    });

    return null;
}

// FPS bridge
function FpsBridge({ onFps }: { onFps: (n: number) => void }) {
    const frames = useRef(0);
    const last = useRef(performance.now());
    useFrame(() => {
        frames.current++;
        const now = performance.now();
        if (now - last.current >= 500) {
            onFps(Math.round((frames.current * 1000) / (now - last.current)));
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
    const [fps, setFps] = useState(60);

    const hovered = useMemo(
        () => PROJECTS.find((p) => p.id === hoveredId) ?? null,
        [hoveredId]
    );

    const targetPos = useMemo(() => {
        if (!hovered) return new THREE.Vector3(0, 0, 0);
        return new THREE.Vector3(
            Math.cos(hovered.angle) * RADIUS,
            0,
            Math.sin(hovered.angle) * RADIUS
        );
    }, [hovered]);

    const targetColor = useMemo(
        () => new THREE.Color(hovered?.color ?? '#E8704F'),
        [hovered]
    );

    // Keyboard nav
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            const idx = hoveredId ? PROJECTS.findIndex((p) => p.id === hoveredId) : -1;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'l' || e.key === 'j') {
                const next = (idx + 1 + PROJECTS.length) % PROJECTS.length;
                setHoveredId(PROJECTS[next].id);
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'h' || e.key === 'k') {
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
                camera={{ position: [0, 4, 14], fov: 55 }}
                gl={{
                    antialias: true,
                    alpha: false,
                    powerPreference: 'high-performance',
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(new THREE.Color('#0E0D0B'));
                }}
            >
                <ambientLight intensity={0.25} />
                <ParticleField
                    targetPos={targetPos}
                    targetStrength={hovered ? 1 : 0}
                    targetColor={targetColor}
                />
                {PROJECTS.map((p) => (
                    <ProjectNode
                        key={p.id}
                        project={p}
                        hovered={hoveredId === p.id}
                        onHover={() => setHoveredId(p.id)}
                        onUnhover={() => setHoveredId((cur) => (cur === p.id ? null : cur))}
                        onClick={() => router.push(p.href)}
                    />
                ))}
                <CameraRig hoveredId={hoveredId} />
                <FpsBridge onFps={setFps} />

                <EffectComposer multisampling={0}>
                    <Bloom
                        intensity={0.35}
                        luminanceThreshold={0.35}
                        luminanceSmoothing={0.6}
                        mipmapBlur
                    />
                    <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0009)} />
                    <Vignette eskil={false} offset={0.18} darkness={0.72} />
                </EffectComposer>
            </Canvas>

            {/* Top-left: back link */}
            <Link
                href="/"
                className="fixed top-20 left-6 z-50 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                home
            </Link>

            {/* Top-center: section title */}
            <p className="fixed top-20 left-1/2 -translate-x-1/2 z-50 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/50">
                3D Lab — {PROJECTS.length} demos
            </p>

            {/* Top-right: keyboard hint */}
            <div className="fixed top-20 right-6 z-50 hidden md:flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/40">
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">←</span>
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">→</span>
                <span>cycle</span>
                <span className="opacity-30">·</span>
                <span className="font-mono px-1.5 py-0.5 border border-[var(--fg)]/20 rounded">↵</span>
                <span>open</span>
            </div>

            {/* Center idle prompt — only when nothing hovered */}
            <AnimatePresence>
                {!hovered && (
                    <motion.div
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, delay: 0.2 }}
                        className="fixed left-1/2 top-[35vh] -translate-x-1/2 z-30 text-center pointer-events-none px-6 max-w-xl"
                    >
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg)]/40 mb-4">
                            Four interactive 3D demos
                        </p>
                        <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.98] mb-4">
                            Hover a node.
                        </h1>
                        <p className="text-sm text-[var(--fg)]/50">
                            Each glowing point is a working demo. Click to enter.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hovered project info card */}
            <AnimatePresence>
                {hovered && (
                    <motion.div
                        key={hovered.id}
                        initial={{ opacity: 0, x: -16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -16 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
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
                            className="inline-flex items-center gap-2 text-sm text-[var(--fg)] group hover:text-[var(--accent)] transition-colors"
                            style={{ color: hovered.color }}
                        >
                            <span className="underline underline-offset-4 decoration-current/40 group-hover:decoration-current">
                                Open demo
                            </span>
                            <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom-center hint */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
                <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--fg)]/40">
                    hover · click to enter
                </p>
            </div>

            {/* Bottom-right stats */}
            <div className="fixed bottom-10 right-6 md:right-12 z-30 text-right pointer-events-none">
                <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">particles</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{COUNT.toLocaleString()}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">nodes</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{PROJECTS.length}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">fps</dt>
                        <dd className="tabular-nums text-[var(--accent)] w-16">{fps}</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
