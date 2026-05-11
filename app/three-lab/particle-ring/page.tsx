'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// ─── Shaders ─────────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute float aOffset;
  attribute float aRing;
  attribute vec3  aSeed;

  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uPointer;
  uniform float uPixelRatio;

  varying float vDepth;
  varying float vRing;
  varying float vGlow;

  float hash(float n) { return fract(sin(n) * 43758.5453123); }

  void main() {
    float ringIdx = aRing;
    float radius = 4.0 + ringIdx * 1.4 + sin(uTime * 0.4 + aOffset * 6.28318) * 0.15;
    float angle  = uTime * (0.18 + 0.06 * ringIdx) + aOffset * 6.28318;

    vec3 pos;
    pos.x = cos(angle) * radius;
    pos.z = sin(angle) * radius;
    pos.y = sin(angle * 2.0 + aSeed.x * 6.28) * (0.35 + ringIdx * 0.25);

    vec2 floorPos = vec2(pos.x, pos.z);
    float d  = length(floorPos - uMouse * 8.0);
    float w  = exp(-d * 0.35) * uPointer;
    pos.y   += w * 1.6;
    pos.xz  += normalize(floorPos - uMouse * 8.0 + 0.0001) * w * 0.6;

    pos *= 1.0 + sin(uTime * 0.6 + aSeed.y * 6.28) * 0.015;

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;

    float baseSize = mix(2.0, 5.0, hash(aOffset * 31.0));
    gl_PointSize = baseSize * uPixelRatio * (300.0 / -mvPos.z) * (0.6 + w * 1.5);

    vDepth = -mvPos.z;
    vRing  = ringIdx;
    vGlow  = 0.4 + w * 1.6 + hash(aOffset) * 0.3;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;

  varying float vDepth;
  varying float vRing;
  varying float vGlow;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c);
    if (r > 0.5) discard;
    float core  = smoothstep(0.50, 0.00, r);
    float halo  = smoothstep(0.50, 0.20, r) * 0.5;

    vec3 col = mix(uColorA, uColorB, vRing * 0.5);
    col      = mix(col,    uColorC, smoothstep(0.5, 1.5, vRing));
    col     *= 0.45 + vGlow * 0.5;

    float depthFade = clamp(1.0 - (vDepth - 6.0) / 30.0, 0.2, 1.0);
    float alpha = (core * 0.55 + halo) * depthFade;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ─── Particle ring ────────────────────────────────────────────────────────────

const RINGS = 3;
const PER_RING = 2200;
const COUNT = RINGS * PER_RING;

function ParticleRing() {
    const matRef = useRef<THREE.ShaderMaterial>(null);
    const ptsRef = useRef<THREE.Points>(null);
    const mouse = useRef(new THREE.Vector2(0, 0));
    const targetMouse = useRef(new THREE.Vector2(0, 0));
    const pointerStrength = useRef(0);
    const targetPointer = useRef(0);

    const { positions, offsets, rings, seeds } = useMemo(() => {
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
            uMouse: { value: new THREE.Vector2(0, 0) },
            uPointer: { value: 0 },
            uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
            uColorA: { value: new THREE.Color('#E8B14F') },
            uColorB: { value: new THREE.Color('#E8704F') },
            uColorC: { value: new THREE.Color('#7AC4D9') },
        }),
        []
    );

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            targetMouse.current.set(
                (e.clientX / window.innerWidth) * 2 - 1,
                -((e.clientY / window.innerHeight) * 2 - 1)
            );
            targetPointer.current = 1;
        };
        const onLeave = () => { targetPointer.current = 0; };
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerleave', onLeave);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerleave', onLeave);
        };
    }, []);

    useFrame((state) => {
        if (!matRef.current) return;
        mouse.current.lerp(targetMouse.current, 0.08);
        pointerStrength.current += (targetPointer.current - pointerStrength.current) * 0.05;
        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uMouse.value.copy(mouse.current);
        uniforms.uPointer.value = pointerStrength.current;
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
                ref={matRef}
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

// ─── Central star ─────────────────────────────────────────────────────────────

function CentralStar() {
    const meshRef = useRef<THREE.Mesh>(null);
    const lightRef = useRef<THREE.PointLight>(null);

    useFrame(({ clock }) => {
        const pulse = Math.sin(clock.elapsedTime * 1.8) * 0.5 + 0.5;
        if (lightRef.current) lightRef.current.intensity = 0.6 + pulse * 0.4;
        if (meshRef.current) {
            const s = 0.12 + pulse * 0.04;
            meshRef.current.scale.setScalar(s);
        }
    });

    return (
        <>
            <pointLight ref={lightRef} position={[0, 0, 0]} color="#fff8e0" intensity={0.8} distance={25} decay={2} />
            <mesh ref={meshRef} position={[0, 0, 0]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color="#fff8e0" toneMapped={false} />
            </mesh>
        </>
    );
}

// ─── Planets ──────────────────────────────────────────────────────────────────

interface PlanetProps {
    orbitRadius: number;
    speed: number;
    size: number;
    color: string;
    tilt: number;
    phase: number;
    hasMoon?: boolean;
}

function Planet({ orbitRadius, speed, size, color, tilt, phase, hasMoon }: PlanetProps) {
    const orbitRef = useRef<THREE.Group>(null);
    const meshRef = useRef<THREE.Mesh>(null);
    const moonOrbitRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        const t = clock.elapsedTime;
        if (orbitRef.current) orbitRef.current.rotation.y = t * speed + phase;
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.018;
            meshRef.current.rotation.x += 0.006;
        }
        if (moonOrbitRef.current) moonOrbitRef.current.rotation.y = t * speed * 3.2;
    });

    return (
        <group rotation={[tilt, 0, 0]}>
            {/* Orbit trail ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[orbitRadius, 0.012, 4, 128]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} toneMapped={false} />
            </mesh>

            {/* Planet */}
            <group ref={orbitRef}>
                <mesh ref={meshRef} position={[orbitRadius, 0, 0]}>
                    <sphereGeometry args={[size, 36, 36]} />
                    <meshStandardMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.35}
                        metalness={0.15}
                        roughness={0.75}
                    />
                </mesh>

                {/* Moon */}
                {hasMoon && (
                    <group position={[orbitRadius, 0, 0]} ref={moonOrbitRef}>
                        <mesh position={[size * 2.5, 0, 0]}>
                            <sphereGeometry args={[size * 0.28, 16, 16]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.15}
                                metalness={0.1}
                                roughness={0.9}
                            />
                        </mesh>
                    </group>
                )}
            </group>
        </group>
    );
}

const PLANET_DATA: PlanetProps[] = [
    { orbitRadius: 9.5,  speed: 0.28, size: 0.32, color: '#E8704F', tilt:  0.28, phase: 0,    hasMoon: false },
    { orbitRadius: 12.0, speed: 0.16, size: 0.55, color: '#7AC4D9', tilt: -0.42, phase: 2.09, hasMoon: true  },
    { orbitRadius: 14.5, speed: 0.09, size: 0.44, color: '#B89BD9', tilt:  0.18, phase: 4.19, hasMoon: false },
    { orbitRadius: 17.0, speed: 0.05, size: 0.72, color: '#E8B14F', tilt: -0.12, phase: 1.05, hasMoon: true  },
];

// ─── FPS bridge ───────────────────────────────────────────────────────────────

function HudBridge({ onFps }: { onFps: (n: number) => void }) {
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

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ParticleRingPage() {
    const [fps, setFps] = useState(60);

    return (
        <div className="fixed inset-0 bg-[var(--bg)]">
            <Canvas
                camera={{ position: [0, 6, 18], fov: 55 }}
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
                <ambientLight intensity={0.15} />
                <Stars radius={60} depth={40} count={1800} factor={3} saturation={0} fade speed={0.3} />

                <CentralStar />
                <ParticleRing />

                {PLANET_DATA.map((p, i) => (
                    <Planet key={i} {...p} />
                ))}

                <HudBridge onFps={setFps} />

                <OrbitControls
                    maxDistance={35}
                    minDistance={8}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.3}
                />
                <EffectComposer multisampling={0}>
                    <Bloom
                        intensity={0.35}
                        luminanceThreshold={0.35}
                        luminanceSmoothing={0.4}
                    />
                    <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0010)} />
                    <Vignette eskil={false} offset={0.15} darkness={0.7} />
                </EffectComposer>
            </Canvas>

            {/* Top bar */}
            <div className="fixed top-20 left-0 right-0 z-50 px-6 flex items-center justify-between pointer-events-none">
                <Link
                    href="/three-lab"
                    className="pointer-events-auto flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    3D Lab
                </Link>
                <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg)]/50 hidden md:block">
                    02 / 04 — Particle Ring
                </p>
                <div className="hidden md:block" />
            </div>

            {/* Bottom-left: title block */}
            <div className="fixed bottom-10 left-6 md:left-12 z-40 max-w-md pointer-events-none">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg)]/50 mb-3">
                    GPU particles · custom shaders · solar system
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.95] mb-3">
                    Particle Ring
                </h1>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-sm">
                    Three concentric rings, {COUNT.toLocaleString()} GPU points. Four planets
                    in orbit — each with its own inclination and speed.
                    Move your cursor to displace the field.
                </p>
            </div>

            {/* Bottom-right: stats */}
            <div className="fixed bottom-10 right-6 md:right-12 z-40 text-right pointer-events-none">
                <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">particles</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{COUNT.toLocaleString()}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">planets</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{PLANET_DATA.length}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">draw calls</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">1</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">fps</dt>
                        <dd className="tabular-nums text-[var(--accent)] w-16">{fps}</dd>
                    </div>
                </dl>
            </div>

            {/* Mid-right hint */}
            <p className="fixed top-1/2 right-6 md:right-12 -translate-y-1/2 z-30 text-[10px] uppercase tracking-[0.2em] text-[var(--fg)]/30 pointer-events-none rotate-90 origin-bottom-right">
                drag to orbit · move cursor to disturb
            </p>
        </div>
    );
}
