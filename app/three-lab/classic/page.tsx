'use client';

import { Suspense, useRef, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Section, SectionTitle, Card } from '@/components/UI';
import { BoxSelect, Layers as LayersIcon, ChevronDown, Rocket, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import Link from 'next/link';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function ThreeLabClassicPage() {
    const canvasRef = useRef<HTMLDivElement>(null);
    const section1Ref = useRef<HTMLDivElement>(null);
    const section2Ref = useRef<HTMLDivElement>(null);
    const section3Ref = useRef<HTMLDivElement>(null);
    const section4Ref = useRef<HTMLDivElement>(null);
    const particleCardRef = useRef<HTMLDivElement>(null);
    const moreCardRef = useRef<HTMLDivElement>(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            setScrollProgress(progress);
        };

        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 30,
                y: (e.clientY / window.innerHeight - 0.5) * 30,
            });
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('mousemove', handleMouseMove);

        if (particleCardRef.current) {
            gsap.fromTo(
                particleCardRef.current,
                { scale: 0, z: -200, opacity: 0 },
                {
                    scale: 1, z: 0, opacity: 1,
                    duration: 1,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: particleCardRef.current,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: 1,
                    },
                }
            );
        }

        if (moreCardRef.current) {
            gsap.fromTo(
                moreCardRef.current,
                { scale: 0, z: -200, opacity: 0 },
                {
                    scale: 1, z: 0, opacity: 1,
                    duration: 1,
                    ease: 'back.out(1.7)',
                    scrollTrigger: {
                        trigger: moreCardRef.current,
                        start: 'top 80%',
                        end: 'top 50%',
                        scrub: 1,
                    },
                }
            );
        }

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('mousemove', handleMouseMove);
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    return (
        <div className="min-h-screen relative">

            {/* â”€â”€ Version comparison banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="fixed top-16 inset-x-0 z-50 flex justify-center pointer-events-none">
                <div className="flex items-center gap-3 bg-black/70 border border-white/10 rounded-full px-4 py-1.5 backdrop-blur-md pointer-events-auto">
                    <span className="text-[10px] uppercase tracking-widest text-white/50 font-mono">Comparing</span>
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Classic</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <Link
                        href="/three-lab"
                        className="text-[10px] uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                    >
                        â† New version
                    </Link>
                </div>
            </div>

            {/* Scroll Progress Rocket */}
            <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
                <div className="relative h-64 w-1 bg-slate-700 rounded-full overflow-hidden">
                    <div
                        className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ height: `${scrollProgress}%` }}
                    />
                </div>
                <div
                    className="absolute transition-all duration-300"
                    style={{
                        top: `calc(${scrollProgress}% - 12px)`,
                        transform: 'translateY(-50%)'
                    }}
                >
                    <Rocket className="w-6 h-6 text-cyan-400 rotate-180" />
                </div>
                <span className="text-xs text-slate-400 font-mono">{Math.round(scrollProgress)}%</span>
            </div>

            {/* Hero Section */}
            <Section className="min-h-screen flex items-center justify-center relative overflow-hidden">
                <div
                    className="absolute inset-0 transition-transform duration-300 ease-out"
                    style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
                >
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-20 left-10 w-72 h-72 bg-primary rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent rounded-full blur-3xl animate-pulse delay-75" />
                        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl animate-pulse delay-150" />
                    </div>
                </div>

                <div className="text-center relative z-10">
                    <div className="inline-block mb-4 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs uppercase tracking-widest font-mono">
                        Classic Version
                    </div>
                    <SectionTitle subtitle="Scroll-based 3D visualization and engineering simulations">
                        3D Engineering Lab
                    </SectionTitle>
                    <p className="text-foreground/60 text-lg mb-8 max-w-2xl mx-auto">
                        Experience interactive 3D engineering visualizations with scroll-triggered animations
                    </p>
                    <div className="flex flex-col items-center gap-2 animate-bounce">
                        <span className="text-sm text-foreground/50">Scroll to explore</span>
                        <ChevronDown className="w-6 h-6 text-primary" />
                    </div>
                </div>
            </Section>

            {/* Scroll-Driven 3D Experience */}
            <div className="relative">
                {/* Fixed Canvas */}
                <div ref={canvasRef} className="sticky top-0 h-screen w-full">
                    <Canvas camera={{ position: [0, 0, 8], fov: 50 }}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={0.5} />
                            <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} intensity={1} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} />
                            <ScrollScene
                                section1Ref={section1Ref}
                                section2Ref={section2Ref}
                                section3Ref={section3Ref}
                                section4Ref={section4Ref}
                            />
                        </Suspense>
                    </Canvas>
                </div>

                {/* Scroll Content Sections */}
                <div className="relative pointer-events-none">
                    {/* Section 1 */}
                    <div ref={section1Ref} className="h-screen flex items-center justify-end px-8 md:px-16">
                        <div className="max-w-md pointer-events-auto">
                            <Card className="bg-background/90 backdrop-blur-lg border-2 border-primary/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <BoxSelect className="w-6 h-6 text-primary" />
                                    <h3 className="text-2xl font-bold text-foreground">Interactive 3D Objects</h3>
                                </div>
                                <p className="text-foreground/80 leading-relaxed">
                                    Explore engineering concepts through interactive 3D visualizations.
                                    Watch as objects transform and animate based on your scroll position.
                                </p>
                            </Card>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div ref={section2Ref} className="h-screen flex items-center justify-start px-8 md:px-16">
                        <div className="max-w-md pointer-events-auto">
                            <Card className="bg-background/90 backdrop-blur-lg border-2 border-accent/30">
                                <h3 className="text-2xl font-bold text-foreground mb-4">Dynamic Transformations</h3>
                                <p className="text-foreground/80 leading-relaxed mb-4">
                                    The cube rotates and scales as you scroll, demonstrating
                                    real-time 3D transformations and animations.
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Rotation</span>
                                    <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">Scaling</span>
                                    <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm">Position</span>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Preview Card - Particle Ring */}
                    <div ref={particleCardRef} className="h-screen flex items-center justify-center px-8">
                        <Link href="/three-lab/particle-ring" className="pointer-events-auto group">
                            <div className="relative overflow-hidden rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20">
                                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                                    <div className="absolute inset-0 opacity-30">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-cyan-500 rounded-full blur-3xl animate-pulse" />
                                        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse delay-75" />
                                    </div>
                                </div>
                                <div className="relative p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Sparkles className="w-8 h-8 text-cyan-400" />
                                        <h3 className="text-2xl font-bold text-slate-200">Particle Ring</h3>
                                    </div>
                                    <p className="text-slate-300 mb-6 leading-relaxed">
                                        Rotating particle system forming mesmerizing concentric rings.
                                        Interactive orbit controls with smooth animations.
                                    </p>
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30">Particles</span>
                                        <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm border border-blue-500/30">Interactive</span>
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">3D Rings</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-cyan-400 group-hover:gap-4 transition-all">
                                        <span className="font-medium">Explore â†’</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Section 3 */}
                    <div ref={section3Ref} className="h-screen flex items-center justify-end px-8 md:px-16">
                        <div className="max-w-md pointer-events-auto">
                            <Card className="bg-background/90 backdrop-blur-lg border-2 border-primary/30">
                                <div className="flex items-center gap-2 mb-4">
                                    <LayersIcon className="w-6 h-6 text-accent" />
                                    <h3 className="text-2xl font-bold text-foreground">Pavement Structure</h3>
                                </div>
                                <p className="text-foreground/80 leading-relaxed mb-4">
                                    Watch as the pavement layers appear one by one, revealing
                                    the complex structure of modern road engineering.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-gray-800 rounded" />
                                        <span className="text-sm text-foreground/70">Asphalt Layer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-yellow-700 rounded" />
                                        <span className="text-sm text-foreground/70">Base Layer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-amber-600 rounded" />
                                        <span className="text-sm text-foreground/70">Subbase Layer</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-orange-900 rounded" />
                                        <span className="text-sm text-foreground/70">Subgrade</span>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    {/* Preview Card - Futuristic Dashboard */}
                    <div ref={moreCardRef} className="h-screen flex items-center justify-center px-8">
                        <Link href="/three-lab/futuristic-dashboard" className="pointer-events-auto group">
                            <div className="relative overflow-hidden rounded-2xl border-2 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20">
                                <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
                                    <div className="absolute inset-0 opacity-30">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500 rounded-full blur-3xl animate-pulse" />
                                        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-pink-500 rounded-full blur-2xl animate-pulse delay-75" />
                                    </div>
                                </div>
                                <div className="relative p-8 backdrop-blur-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Rocket className="w-8 h-8 text-purple-400" />
                                        <h3 className="text-2xl font-bold text-slate-200">Futuristic Dashboard</h3>
                                    </div>
                                    <p className="text-slate-300 mb-6 leading-relaxed">
                                        Interactive 3D dashboard with floating geometric shapes, holographic rings,
                                        distorted spheres, and pulsing light orbs in a tech-inspired environment.
                                    </p>
                                    <div className="flex gap-2 flex-wrap mb-4">
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">Interactive</span>
                                        <span className="px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full text-sm border border-pink-500/30">Real-time</span>
                                        <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm border border-purple-500/30">WebGL</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-purple-400 group-hover:gap-4 transition-all">
                                        <span className="font-medium">Explore â†’</span>
                                    </div>
                                </div>
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                    <div className="absolute inset-0 bg-linear-to-r from-transparent via-purple-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Section 4 */}
                    <div ref={section4Ref} className="h-screen flex items-center justify-center px-8">
                        <div className="max-w-2xl pointer-events-auto text-center">
                            <Card className="bg-background/90 backdrop-blur-lg border-2 border-accent/30">
                                <h3 className="text-3xl font-bold text-foreground mb-4">Engineering Visualization</h3>
                                <p className="text-foreground/80 leading-relaxed mb-6">
                                    This is just the beginning. Imagine complex structural analysis,
                                    real-time simulations, and interactive engineering tools powered
                                    by cutting-edge 3D technology.
                                </p>
                                <div className="flex flex-wrap gap-3 justify-center">
                                    <span className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium">Three.js</span>
                                    <span className="px-4 py-2 bg-accent/20 text-accent rounded-lg text-sm font-medium">GSAP ScrollTrigger</span>
                                    <span className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-sm font-medium">React Three Fiber</span>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>

            {/* Static Content Below */}
            <Section className="bg-card/30">
                <h3 className="text-2xl font-bold text-foreground mb-6 text-center">Traditional 3D Viewers</h3>

                <div className="max-w-xl mx-auto">
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <BoxSelect className="w-5 h-5 text-primary" />
                            <h3 className="text-xl font-semibold text-foreground">Rotating Object</h3>
                        </div>
                        <p className="text-foreground/70 mb-4 text-sm">
                            Interactive 3D object with orbit controls. Drag to rotate, scroll to zoom.
                        </p>
                        <div className="h-96 bg-linear-to-br from-background to-card rounded-lg overflow-hidden">
                            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                                <Suspense fallback={null}>
                                    <ambientLight intensity={0.5} />
                                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
                                    <pointLight position={[-10, -10, -10]} />
                                    <RotatingCube />
                                    <OrbitControls />
                                </Suspense>
                            </Canvas>
                        </div>
                    </Card>
                </div>

                <div className="grid md:grid-cols-4 gap-6 mt-6">
                    <Card>
                        <div className="w-full h-4 bg-gray-800 rounded mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">Asphalt Layer</h4>
                        <p className="text-sm text-foreground/70">Surface layer, typically 5-10 cm thick</p>
                    </Card>
                    <Card>
                        <div className="w-full h-4 bg-yellow-700 rounded mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">Base Layer</h4>
                        <p className="text-sm text-foreground/70">Crushed stone, 15-30 cm thick</p>
                    </Card>
                    <Card>
                        <div className="w-full h-4 bg-amber-600 rounded mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">Subbase Layer</h4>
                        <p className="text-sm text-foreground/70">Granular material, 20-40 cm thick</p>
                    </Card>
                    <Card>
                        <div className="w-full h-4 bg-orange-900 rounded mb-3" />
                        <h4 className="font-semibold text-foreground mb-1">Subgrade</h4>
                        <p className="text-sm text-foreground/70">Natural soil foundation</p>
                    </Card>
                </div>

                <Card className="mt-6 bg-linear-to-br from-primary/10 to-accent/10">
                    <h3 className="text-xl font-semibold text-foreground mb-4">Coming Soon</h3>
                    <ul className="space-y-2 text-foreground/70">
                        <li className="flex items-start gap-2"><span className="text-primary">âœ¦</span><span>FWD deflection basin visualization in 3D</span></li>
                        <li className="flex items-start gap-2"><span className="text-accent">âœ¦</span><span>Interactive stress distribution analysis</span></li>
                        <li className="flex items-start gap-2"><span className="text-primary">âœ¦</span><span>3D product design models and CAD exports</span></li>
                        <li className="flex items-start gap-2"><span className="text-accent">âœ¦</span><span>Real-time engineering simulations</span></li>
                    </ul>
                </Card>
            </Section>
        </div>
    );
}

// â”€â”€â”€ Scroll Scene â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface ScrollSceneProps {
    section1Ref: React.RefObject<HTMLDivElement | null>;
    section2Ref: React.RefObject<HTMLDivElement | null>;
    section3Ref: React.RefObject<HTMLDivElement | null>;
    section4Ref: React.RefObject<HTMLDivElement | null>;
}

function ScrollScene({ section1Ref, section2Ref, section3Ref, section4Ref }: ScrollSceneProps) {
    const cubeRef = useRef<THREE.Mesh>(null);
    const layersGroupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (!cubeRef.current || !layersGroupRef.current) return;

        const cube = cubeRef.current;

        if (section1Ref.current) {
            gsap.fromTo(cube.rotation, { x: 0, y: 0, z: 0 }, {
                x: Math.PI * 0.5, y: Math.PI * 0.5, z: 0,
                scrollTrigger: { trigger: section1Ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
            });
            gsap.fromTo(cube.scale, { x: 0.1, y: 0.1, z: 0.1 }, {
                x: 1, y: 1, z: 1,
                scrollTrigger: { trigger: section1Ref.current, start: 'top center', end: 'center center', scrub: 1 },
            });
        }

        if (section2Ref.current) {
            gsap.to(cube.rotation, {
                x: Math.PI * 2, y: Math.PI * 2, z: Math.PI * 0.5,
                scrollTrigger: { trigger: section2Ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
            });
            gsap.to(cube.position, {
                x: 2, y: 1,
                scrollTrigger: { trigger: section2Ref.current, start: 'top center', end: 'bottom center', scrub: 1 },
            });
            gsap.to(cube.scale, {
                x: 1.5, y: 1.5, z: 1.5,
                scrollTrigger: { trigger: section2Ref.current, start: 'top center', end: 'center center', scrub: 1 },
            });
        }

        if (section3Ref.current) {
            gsap.to(cube.scale, {
                x: 0.1, y: 0.1, z: 0.1,
                scrollTrigger: { trigger: section3Ref.current, start: 'top center', end: 'bottom center', scrub: 1 },
            });
            gsap.to(cube.position, {
                x: 0, y: 0,
                scrollTrigger: { trigger: section3Ref.current, start: 'top center', end: 'bottom center', scrub: 1 },
            });
        }

        if (section4Ref.current) {
            gsap.to(camera.position, {
                z: 12, y: 5,
                scrollTrigger: { trigger: section4Ref.current, start: 'top center', end: 'center center', scrub: 1 },
            });
            gsap.to(cube.rotation, {
                x: Math.PI * 3, y: Math.PI * 3,
                scrollTrigger: { trigger: section4Ref.current, start: 'top center', end: 'bottom center', scrub: 1 },
            });
        }

        return () => { ScrollTrigger.getAll().forEach(t => t.kill()); };
    }, [section1Ref, section2Ref, section3Ref, section4Ref, camera]);

    return (
        <>
            <mesh ref={cubeRef}>
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#2563EB" metalness={0.6} roughness={0.2} />
            </mesh>
            <group ref={layersGroupRef} visible={false}>
                <PavementLayers />
            </group>
            <gridHelper args={[20, 20, '#334155', '#1e293b']} position={[0, -3, 0]} />
        </>
    );
}

// â”€â”€â”€ Rotating Cube â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
            <meshStandardMaterial color="#2563EB" metalness={0.5} roughness={0.2} />
        </mesh>
    );
}

// â”€â”€â”€ Pavement Layers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function PavementLayers() {
    const layers: { color: string; position: [number, number, number]; height: number }[] = [
        { color: '#1f2937', position: [0, 1.5, 0], height: 0.3 },
        { color: '#a16207', position: [0, 0.9, 0], height: 0.6 },
        { color: '#d97706', position: [0, 0.0, 0], height: 0.9 },
        { color: '#9a3412', position: [0, -1.2, 0], height: 1.2 },
    ];

    return (
        <group>
            {layers.map((layer, i) => (
                <mesh key={i} position={layer.position}>
                    <boxGeometry args={[4, layer.height, 4]} />
                    <meshStandardMaterial color={layer.color} />
                </mesh>
            ))}
        </group>
    );
}

