'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { pointsInner, pointsOuter } from '@/lib/particleUtils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { Group } from 'three';

export default function ParticleRingPage() {
    return (
        <div className="relative w-full" style={{ height: '100vh' }}>
            <Canvas
                camera={{
                    position: [10, -7.5, -5],
                    fov: 75,
                }}
                style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                }}
            >
                <OrbitControls maxDistance={20} minDistance={10} />
                <directionalLight />
                <pointLight position={[-30, 0, -30]} intensity={10.0} />
                <PointCircle />
            </Canvas>

            <h1
                className="absolute text-slate-200 font-medium text-2xl md:text-3xl pointer-events-none select-none text-center"
                style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)', zIndex: 10 }}
            >
                Drag &amp; Zoom
            </h1>

            <Link
                href="/three-lab"
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm text-slate-200 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/60"
                style={{ zIndex: 10 }}
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Lab</span>
            </Link>
        </div>
    );
}

function PointCircle() {
    const ref = useRef<Group>(null);

    useFrame(({ clock }) => {
        if (ref.current?.rotation) {
            ref.current.rotation.z = clock.getElapsedTime() * 0.05;
        }
    });

    return (
        <group ref={ref}>
            {pointsInner.map((point) => (
                <Point key={point.idx} position={point.position} color={point.color} />
            ))}
            {pointsOuter.map((point) => (
                <Point key={point.idx} position={point.position} color={point.color} />
            ))}
        </group>
    );
}

interface PointProps {
    position: [number, number, number];
    color: string;
}

function Point({ position, color }: PointProps) {
    return (
        <Sphere position={position} args={[0.1, 10, 10]}>
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.5}
                roughness={0.5}
                color={color}
            />
        </Sphere>
    );
}
