'use client';

import { Suspense, useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import {
    OrbitControls,
    Float,
    MeshDistortMaterial,
    Sphere,
    Box,
    Torus,
    Environment,
} from '@react-three/drei';
import {
    EffectComposer,
    Bloom,
    Vignette,
} from '@react-three/postprocessing';
import * as THREE from 'three';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ─── Scene primitives ────────────────────────────────────────────────────────

function DataSphere({
    position,
    color,
}: {
    position: [number, number, number];
    color: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.3;
        meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        const target = hovered ? 1.3 : 1;
        meshRef.current.scale.lerp(
            new THREE.Vector3(target, target, target),
            0.1
        );
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere
                ref={meshRef}
                args={[1, 64, 64]}
                position={position}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                <MeshDistortMaterial
                    color={color}
                    attach="material"
                    distort={0.4}
                    speed={2}
                    roughness={0.2}
                    metalness={0.85}
                />
            </Sphere>
        </Float>
    );
}

function HolographicRing({
    position,
    color,
}: {
    position: [number, number, number];
    color: string;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
        meshRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    });
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1}>
            <Torus ref={meshRef} args={[1.5, 0.08, 16, 100]} position={position}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1.2}
                    metalness={0.9}
                    roughness={0.1}
                    wireframe
                />
            </Torus>
        </Float>
    );
}

function DataCube({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [active, setActive] = useState(false);
    useFrame(() => {
        if (!meshRef.current) return;
        meshRef.current.rotation.x += 0.01;
        meshRef.current.rotation.y += 0.01;
        const scale = active ? 1.5 : 1;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
    });
    return (
        <Float speed={3} rotationIntensity={2} floatIntensity={1.5}>
            <Box
                ref={meshRef}
                args={[1, 1, 1]}
                position={position}
                onClick={() => setActive(!active)}
            >
                <meshStandardMaterial
                    color={active ? '#E8B14F' : '#E8704F'}
                    emissive={active ? '#E8B14F' : '#E8704F'}
                    emissiveIntensity={active ? 1.2 : 0.5}
                    metalness={0.85}
                    roughness={0.15}
                    wireframe={active}
                />
            </Box>
        </Float>
    );
}

function generateParticleData(count: number) {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const palette = [
        new THREE.Color('#E8704F'),
        new THREE.Color('#E8B14F'),
        new THREE.Color('#7AC4D9'),
        new THREE.Color('#B89BD9'),
    ];
    for (let i = 0; i < count; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
        const c = palette[i % palette.length];
        colors[i * 3] = c.r;
        colors[i * 3 + 1] = c.g;
        colors[i * 3 + 2] = c.b;
    }
    return { positions, colors, count };
}

function ParticleField() {
    const particlesRef = useRef<THREE.Points>(null);
    const data = useMemo(() => generateParticleData(1500), []);
    useFrame(() => {
        if (particlesRef.current) particlesRef.current.rotation.y += 0.0005;
    });
    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[data.positions, 3]}
                    count={data.count}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[data.colors, 3]}
                    count={data.count}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.04}
                vertexColors
                transparent
                opacity={0.7}
                sizeAttenuation
            />
        </points>
    );
}

function LightOrb({
    position,
    color,
}: {
    position: [number, number, number];
    color: string;
}) {
    const lightRef = useRef<THREE.PointLight>(null);
    useFrame((state) => {
        if (lightRef.current) {
            lightRef.current.intensity =
                2 + Math.sin(state.clock.elapsedTime * 2) * 1;
        }
    });
    return (
        <>
            <pointLight
                ref={lightRef}
                position={position}
                color={color}
                intensity={2}
                distance={10}
            />
            <Float speed={2} floatIntensity={2}>
                <Sphere args={[0.18, 32, 32]} position={position}>
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={2}
                    />
                </Sphere>
            </Float>
        </>
    );
}

function DashboardScene() {
    return (
        <>
            <ambientLight intensity={0.25} />
            <spotLight
                position={[10, 10, 10]}
                angle={0.3}
                penumbra={1}
                intensity={1}
            />
            <spotLight
                position={[-10, -10, -10]}
                angle={0.3}
                penumbra={1}
                intensity={0.5}
                color="#7AC4D9"
            />
            <Environment preset="night" />

            <LightOrb position={[5, 5, 0]} color="#E8704F" />
            <LightOrb position={[-5, -5, 0]} color="#7AC4D9" />
            <LightOrb position={[0, 5, -5]} color="#E8B14F" />

            <DataSphere position={[-4, 2, 0]} color="#E8704F" />
            <DataSphere position={[4, -2, 0]} color="#7AC4D9" />
            <DataSphere position={[0, 3, -3]} color="#B89BD9" />

            <HolographicRing position={[0, 0, 0]} color="#7AC4D9" />
            <HolographicRing position={[3, 1, -2]} color="#E8704F" />
            <HolographicRing position={[-3, -1, 2]} color="#E8B14F" />

            <DataCube position={[2, 3, -1]} />
            <DataCube position={[-2, -3, 1]} />
            <DataCube position={[0, -2, -4]} />

            <ParticleField />

            <OrbitControls
                enableZoom
                enablePan
                enableRotate
                autoRotate
                autoRotateSpeed={0.4}
                minDistance={6}
                maxDistance={20}
            />
        </>
    );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function FuturisticDashboardPage() {
    const [fps, setFps] = useState(60);

    useEffect(() => {
        let raf = 0;
        let frames = 0;
        let last = performance.now();
        const tick = () => {
            frames++;
            const now = performance.now();
            if (now - last >= 500) {
                setFps(Math.round((frames * 1000) / (now - last)));
                frames = 0;
                last = now;
            }
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    return (
        <div className="fixed inset-0 bg-[var(--bg)] text-[var(--fg)] overflow-hidden">
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
                    03 / 04 — Holographic Field
                </p>
                <div />
            </div>

            {/* Canvas */}
            <div className="absolute inset-0 pt-28">
                <Canvas
                    camera={{ position: [0, 0, 15], fov: 60 }}
                    shadows
                    gl={{
                        antialias: true,
                        alpha: true,
                        powerPreference: 'high-performance',
                    }}
                    onCreated={({ gl }) => {
                        gl.setClearColor(new THREE.Color('#0E0D0B'), 1);
                    }}
                >
                    <Suspense fallback={null}>
                        <DashboardScene />
                        <EffectComposer multisampling={0}>
                            <Bloom
                                intensity={0.7}
                                luminanceThreshold={0.15}
                                luminanceSmoothing={0.4}
                                mipmapBlur
                            />
                            <Vignette eskil={false} offset={0.18} darkness={0.6} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </div>

            {/* Bottom-left title */}
            <div className="fixed bottom-10 left-6 md:left-12 z-30 max-w-md pointer-events-none">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg)]/50 mb-3">
                    Distortion shaders · environment maps
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.95] mb-3">
                    Holographic Field
                </h1>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-sm">
                    Distorted spheres, wireframe tori, light orbs, a 1,500-point
                    field. Hover the spheres, click the cubes — every primitive
                    has a state.
                </p>
            </div>

            {/* Bottom-right stats */}
            <div className="fixed bottom-10 right-6 md:right-12 z-30 text-right pointer-events-none">
                <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">
                            primitives
                        </dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">12</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">
                            particles
                        </dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">1,500</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">
                            fps
                        </dt>
                        <dd className="tabular-nums text-[var(--accent)] w-16">{fps}</dd>
                    </div>
                </dl>
            </div>

            {/* Top-right hint */}
            <p className="fixed top-32 right-6 md:right-12 z-30 text-[10px] uppercase tracking-[0.2em] text-[var(--fg)]/30 pointer-events-none text-right">
                drag · zoom · click cubes · hover spheres
            </p>
        </div>
    );
}
