'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import { pointsInner, pointsOuter } from '@/lib/particleUtils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import * as THREE from 'three';

const ParticleRingPage = () => {
    return (
        <div className="relative">
            <Canvas
                camera={{
                    position: [10, -7.5, -5],
                    fov: 75,
                }}
                style={{ height: '100vh' }}
                className="bg-slate-900"
            >
                <OrbitControls maxDistance={20} minDistance={10} />
                <ambientLight intensity={0.5} />
                <pointLight position={[-30, 0, -30]} intensity={1.0} />
                <pointLight position={[30, 0, 30]} intensity={0.5} />
                <PointCircle />
            </Canvas>

            <h1 className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] text-slate-200 font-medium text-2xl md:text-5xl pointer-events-none">
                Drag & Zoom
            </h1>

            {/* Back Button */}
            <Link
                href="/three-lab"
                className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700/80 backdrop-blur-sm text-slate-200 rounded-lg transition-all border border-cyan-500/30 hover:border-cyan-500/60"
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Lab</span>
            </Link>
        </div>
    );
};

const PointCircle = () => {
    const ref = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
        if (ref.current?.rotation) {
            ref.current.rotation.z = clock.getElapsedTime() * 0.05;
            ref.current.rotation.y = clock.getElapsedTime() * 0.03;
            ref.current.rotation.x = clock.getElapsedTime() * 0.02;
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
};

interface PointProps {
    position: [number, number, number];
    color: string;
}

const Point = ({ position, color }: PointProps) => {
    return (
        <Sphere position={position} args={[0.05, 6, 6]}>
            <meshStandardMaterial
                emissive={color}
                emissiveIntensity={0.8}
                roughness={0.3}
                color={color}
            />
        </Sphere>
    );
};

export default ParticleRingPage;
