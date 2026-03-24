'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Sliders } from 'lucide-react';
import { useState } from 'react';

const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

const COLOR_PRESETS: { label: string; colors: number[]; swatches: string[] }[] = [
    { label: 'Neon', colors: [0x6366f1, 0x8b5cf6, 0xec4899, 0x06b6d4], swatches: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'] },
    { label: 'Fire', colors: [0xef4444, 0xf97316, 0xeab308, 0xfbbf24], swatches: ['#ef4444', '#f97316', '#eab308', '#fbbf24'] },
    { label: 'Ocean', colors: [0x0ea5e9, 0x06b6d4, 0x10b981, 0x3b82f6], swatches: ['#0ea5e9', '#06b6d4', '#10b981', '#3b82f6'] },
    { label: 'Sunset', colors: [0xf97316, 0xec4899, 0xa855f7, 0x6366f1], swatches: ['#f97316', '#ec4899', '#a855f7', '#6366f1'] },
    { label: 'Gold', colors: [0xfbbf24, 0xf59e0b, 0xd97706, 0xef4444], swatches: ['#fbbf24', '#f59e0b', '#d97706', '#ef4444'] },
    { label: 'Mono', colors: [0xffffff, 0x888888, 0x333333], swatches: ['#ffffff', '#888888', '#333333'] },
];

export default function BallpitPage() {
    const [count, setCount] = useState(100);
    const [gravity, setGravity] = useState(0.5);
    const [friction, setFriction] = useState(0.9975);
    const [wallBounce, setWallBounce] = useState(0.95);
    const [followCursor, setFollowCursor] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [activePreset, setActivePreset] = useState(0);
    const [colors, setColors] = useState<number[]>(COLOR_PRESETS[0].colors);

    return (
        <div className="min-h-screen bg-black text-white flex flex-col">
            {/* Top bar */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-black/40 backdrop-blur-md border-b border-white/10">
                <Link href="/three-lab" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">3D Lab</span>
                </Link>
                <div className="text-center">
                    <h1 className="text-lg font-bold text-white tracking-wide">Ball Pit</h1>
                    <p className="text-xs text-slate-500">Physics Simulation</p>
                </div>
                <button
                    onClick={() => setShowControls(v => !v)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Sliders className="w-5 h-5" />
                    <span className="text-sm font-medium">Controls</span>
                </button>
            </div>

            {/* Canvas area */}
            <div className="flex-1 relative" style={{ minHeight: '100vh' }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: '100vh', width: '100%' }}>
                    <Ballpit
                        count={count}
                        gravity={gravity}
                        friction={friction}
                        wallBounce={wallBounce}
                        followCursor={followCursor}
                        colors={colors}
                    />
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-12 left-8 z-10 pointer-events-none">
                    <p className="text-xs text-slate-600 mb-1 uppercase tracking-widest">Inspired by Kevin Levron</p>
                    <h2 className="text-4xl font-black text-white/90 tracking-tight leading-none">Ball Pit</h2>
                    <p className="text-slate-400 text-sm mt-2">Real-time physics · {count} balls · Three.js</p>
                </div>
            </div>

            {/* Side controls drawer */}
            <div className={`fixed top-0 right-0 h-full w-80 bg-black/90 backdrop-blur-xl border-l border-white/10
                transition-transform duration-300 z-40 flex flex-col pt-20 pb-8 px-6 gap-6 overflow-y-auto
                ${showControls ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <h3 className="text-lg font-bold text-white">Controls</h3>

                {/* Color presets */}
                <div className="flex flex-col gap-3">
                    <span className="text-sm text-slate-300 font-medium">Color Palette</span>
                    <div className="grid grid-cols-3 gap-2">
                        {COLOR_PRESETS.map((preset, i) => (
                            <button
                                key={preset.label}
                                onClick={() => { setActivePreset(i); setColors(preset.colors); }}
                                className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-150
                                    ${activePreset === i
                                        ? 'border-white/40 bg-white/10'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'}`}
                            >
                                <div className="flex gap-0.5">
                                    {preset.swatches.map(s => (
                                        <span key={s} className="w-4 h-4 rounded-full" style={{ background: s }} />
                                    ))}
                                </div>
                                <span className="text-xs text-slate-400">{preset.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-white/10" />

                <ControlSlider label="Ball Count" value={count} min={10} max={300} step={5} format={v => String(v)} onChange={setCount} />
                <ControlSlider label="Gravity" value={gravity} min={0} max={2} step={0.05} format={v => v.toFixed(2)} onChange={setGravity} />
                <ControlSlider label="Friction" value={friction} min={0.9} max={1.0} step={0.0005} format={v => v.toFixed(4)} onChange={setFriction} />
                <ControlSlider label="Wall Bounce" value={wallBounce} min={0.3} max={1.0} step={0.01} format={v => v.toFixed(2)} onChange={setWallBounce} />

                {/* Follow Cursor toggle */}
                <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-300 font-medium">Follow Cursor</span>
                    <button
                        onClick={() => setFollowCursor(v => !v)}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${followCursor ? 'bg-indigo-500' : 'bg-slate-700'}`}
                    >
                        <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${followCursor ? 'translate-x-7' : 'translate-x-1'}`} />
                    </button>
                </div>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <p className="text-xs text-slate-600 leading-relaxed">
                        Gravity · friction · wall bounce · ball–ball collision.
                        Hover to push balls with cursor. Built with Three.js.
                    </p>
                </div>
            </div>
        </div>
    );
}

interface ControlSliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    format: (v: number) => string;
    onChange: (v: number) => void;
}

function ControlSlider({ label, value, min, max, step, format, onChange }: ControlSliderProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300 font-medium">{label}</span>
                <span className="text-sm font-mono text-indigo-400">{format(value)}</span>
            </div>
            <input
                type="range" min={min} max={max} step={step} value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none bg-slate-700 accent-indigo-500 cursor-pointer"
            />
        </div>
    );
}
