'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Sliders, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

const COLOR_PRESETS: { label: string; colors: number[]; swatches: string[] }[] = [
    { label: 'Coral', colors: [0xE8704F, 0xC25A3D, 0xF5DCC9, 0x7C2D17], swatches: ['#E8704F', '#C25A3D', '#F5DCC9', '#7C2D17'] },
    { label: 'Amber', colors: [0xE8B14F, 0xF59E0B, 0xFCD34D, 0x78350F], swatches: ['#E8B14F', '#F59E0B', '#FCD34D', '#78350F'] },
    { label: 'Cyan', colors: [0x7AC4D9, 0x06B6D4, 0xCFE9F2, 0x1F4A56], swatches: ['#7AC4D9', '#06B6D4', '#CFE9F2', '#1F4A56'] },
    { label: 'Lavender', colors: [0xB89BD9, 0xA78BFA, 0xE1D4F2, 0x3A285A], swatches: ['#B89BD9', '#A78BFA', '#E1D4F2', '#3A285A'] },
    { label: 'Mono', colors: [0xF5F1EA, 0xA39D8F, 0x6B6759, 0x1A1812], swatches: ['#F5F1EA', '#A39D8F', '#6B6759', '#1A1812'] },
    { label: 'Forest', colors: [0x84CC16, 0x65A30D, 0xBEF264, 0x1A2E05], swatches: ['#84CC16', '#65A30D', '#BEF264', '#1A2E05'] },
];

export default function BallpitPage() {
    const [count, setCount] = useState(150);
    const [gravity, setGravity] = useState(0.5);
    const [friction, setFriction] = useState(0.9975);
    const [wallBounce, setWallBounce] = useState(0.95);
    const [followCursor, setFollowCursor] = useState(true);
    const [showControls, setShowControls] = useState(false);
    const [activePreset, setActivePreset] = useState(0);
    const [colors, setColors] = useState<number[]>(COLOR_PRESETS[0].colors);
    const [fps, setFps] = useState(60);

    // Lightweight RAF-based FPS meter
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
                    01 / 04 — Ball Pit
                </p>
                <button
                    onClick={() => setShowControls((v) => !v)}
                    className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[var(--fg)]/60 hover:text-[var(--fg)] transition-colors"
                >
                    <Sliders className="w-3.5 h-3.5" />
                    Controls
                </button>
            </div>

            {/* Canvas */}
            <div className="absolute inset-0 pt-28">
                <Ballpit
                    count={count}
                    gravity={gravity}
                    friction={friction}
                    wallBounce={wallBounce}
                    followCursor={followCursor}
                    colors={colors}
                />
            </div>

            {/* Bottom-left title */}
            <div className="fixed bottom-10 left-6 md:left-12 z-30 max-w-md pointer-events-none">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--fg)]/50 mb-3">
                    Soft-body physics · rapier · three.js
                </p>
                <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.95] mb-3">
                    Ball Pit
                </h1>
                <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-sm">
                    Real-time rigid-body simulation. Hover to push the field. Open
                    Controls to retune gravity, friction, wall bounce, count.
                </p>
            </div>

            {/* Bottom-right stats */}
            <div className="fixed bottom-10 right-6 md:right-12 z-30 text-right pointer-events-none">
                <dl className="space-y-1.5 font-mono text-xs">
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">bodies</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{count}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">gravity</dt>
                        <dd className="tabular-nums text-[var(--fg)]/70 w-16">{gravity.toFixed(2)}</dd>
                    </div>
                    <div className="flex items-baseline justify-end gap-3">
                        <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">fps</dt>
                        <dd className="tabular-nums text-[var(--accent)] w-16">{fps}</dd>
                    </div>
                </dl>
            </div>

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-[var(--bg)]/95 backdrop-blur-xl border-l border-[var(--hairline)] z-50 flex flex-col transition-transform duration-300 ${showControls ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--hairline)]">
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                        Controls
                    </p>
                    <button
                        onClick={() => setShowControls(false)}
                        className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                    {/* Palette */}
                    <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)] mb-4">
                            Palette
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {COLOR_PRESETS.map((preset, i) => (
                                <button
                                    key={preset.label}
                                    onClick={() => {
                                        setActivePreset(i);
                                        setColors(preset.colors);
                                    }}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-md border transition-all ${activePreset === i
                                        ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                                        : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                                        }`}
                                >
                                    <div className="flex gap-0.5">
                                        {preset.swatches.map((s) => (
                                            <span
                                                key={s}
                                                className="w-3 h-3 rounded-full"
                                                style={{ background: s }}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--fg-muted)]">
                                        {preset.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="border-t border-[var(--hairline)]" />

                    <ControlSlider
                        label="Ball count"
                        value={count}
                        min={10}
                        max={300}
                        step={5}
                        format={(v) => String(v)}
                        onChange={setCount}
                    />
                    <ControlSlider
                        label="Gravity"
                        value={gravity}
                        min={0}
                        max={2}
                        step={0.05}
                        format={(v) => v.toFixed(2)}
                        onChange={setGravity}
                    />
                    <ControlSlider
                        label="Friction"
                        value={friction}
                        min={0.9}
                        max={1.0}
                        step={0.0005}
                        format={(v) => v.toFixed(4)}
                        onChange={setFriction}
                    />
                    <ControlSlider
                        label="Wall bounce"
                        value={wallBounce}
                        min={0.3}
                        max={1.0}
                        step={0.01}
                        format={(v) => v.toFixed(2)}
                        onChange={setWallBounce}
                    />

                    {/* Toggle */}
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-[var(--fg)]">
                            Follow cursor
                        </span>
                        <button
                            onClick={() => setFollowCursor((v) => !v)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${followCursor
                                ? 'bg-[var(--accent)]'
                                : 'bg-[var(--bg-card)] border border-[var(--hairline-strong)]'
                                }`}
                            aria-pressed={followCursor}
                        >
                            <span
                                className={`absolute top-0.5 w-5 h-5 rounded-full bg-[var(--fg)] transition-transform ${followCursor ? 'translate-x-5' : 'translate-x-0.5'
                                    }`}
                            />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--hairline)]">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-dim)] leading-relaxed">
                        Each parameter feeds directly into the rapier physics
                        world. No reload — changes apply on the next frame.
                    </p>
                </div>
            </div>

            {/* Backdrop when drawer open */}
            {showControls && (
                <button
                    aria-label="Close controls"
                    onClick={() => setShowControls(false)}
                    className="fixed inset-0 z-40 bg-black/40 sm:hidden"
                />
            )}
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

function ControlSlider({
    label,
    value,
    min,
    max,
    step,
    format,
    onChange,
}: ControlSliderProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--fg)]">{label}</span>
                <span className="font-mono text-xs text-[var(--accent)] tabular-nums">
                    {format(value)}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="w-full h-1 rounded-full appearance-none bg-[var(--bg-card)] cursor-pointer accent-[var(--accent)]"
                style={
                    {
                        '--range-progress': `${((value - min) / (max - min)) * 100}%`,
                    } as React.CSSProperties
                }
            />
        </div>
    );
}
