'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, Sliders, X, RotateCcw, MousePointer, MousePointer2Off } from 'lucide-react';
import { useEffect, useState } from 'react';

const Ballpit = dynamic(() => import('@/components/Ballpit'), { ssr: false });

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULTS: {
    count: number; gravity: number; friction: number;
    wallBounce: number; followCursor: boolean; preset: number;
} = {
    count:        150,
    gravity:      0.5,
    friction:     0.9975,
    wallBounce:   0.95,
    followCursor: true,
    preset:       0,
};

// ─── Color presets ─────────────────────────────────────────────────────────────

const COLOR_PRESETS = [
    { label: 'Coral',    colors: [0xE8704F, 0xC25A3D, 0xF5DCC9, 0x7C2D17], swatches: ['#E8704F', '#C25A3D', '#F5DCC9', '#7C2D17'] },
    { label: 'Amber',    colors: [0xE8B14F, 0xF59E0B, 0xFCD34D, 0x78350F], swatches: ['#E8B14F', '#F59E0B', '#FCD34D', '#78350F'] },
    { label: 'Cyan',     colors: [0x7AC4D9, 0x06B6D4, 0xCFE9F2, 0x1F4A56], swatches: ['#7AC4D9', '#06B6D4', '#CFE9F2', '#1F4A56'] },
    { label: 'Lavender', colors: [0xB89BD9, 0xA78BFA, 0xE1D4F2, 0x3A285A], swatches: ['#B89BD9', '#A78BFA', '#E1D4F2', '#3A285A'] },
    { label: 'Mono',     colors: [0xF5F1EA, 0xA39D8F, 0x6B6759, 0x1A1812], swatches: ['#F5F1EA', '#A39D8F', '#6B6759', '#1A1812'] },
    { label: 'Forest',   colors: [0x84CC16, 0x65A30D, 0xBEF264, 0x1A2E05], swatches: ['#84CC16', '#65A30D', '#BEF264', '#1A2E05'] },
];

// Gravity quick-set buttons
const GRAVITY_PRESETS = [
    { label: 'Zero-G', value: 0 },
    { label: 'Moon',   value: 0.16 },
    { label: 'Normal', value: 0.5 },
    { label: 'Heavy',  value: 1.5 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BallpitPage() {
    const [count,        setCount]        = useState(DEFAULTS.count);
    const [gravity,      setGravity]      = useState(DEFAULTS.gravity);
    const [friction,     setFriction]     = useState(DEFAULTS.friction);
    const [wallBounce,   setWallBounce]   = useState(DEFAULTS.wallBounce);
    const [followCursor, setFollowCursor] = useState(DEFAULTS.followCursor);
    const [showControls, setShowControls] = useState(false);
    const [activePreset, setActivePreset] = useState(DEFAULTS.preset);
    const [colors,       setColors]       = useState<number[]>(COLOR_PRESETS[0].colors);
    const [fps,          setFps]          = useState(60);

    useEffect(() => {
        let raf = 0, frames = 0, last = performance.now();
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

    const handleReset = () => {
        setCount(DEFAULTS.count);
        setGravity(DEFAULTS.gravity);
        setFriction(DEFAULTS.friction);
        setWallBounce(DEFAULTS.wallBounce);
        setFollowCursor(DEFAULTS.followCursor);
        setActivePreset(DEFAULTS.preset);
        setColors(COLOR_PRESETS[DEFAULTS.preset].colors);
    };

    return (
        <>
            {/* Slider thumb + track CSS — can't do pseudo-elements in Tailwind inline */}
            <style>{`
                .bp-range {
                    -webkit-appearance: none;
                    appearance: none;
                    height: 3px;
                    border-radius: 9999px;
                    outline: none;
                    cursor: pointer;
                    width: 100%;
                }
                .bp-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--fg);
                    cursor: pointer;
                    border: 2px solid var(--bg);
                    box-shadow: 0 0 0 1px rgba(245,241,234,0.25);
                    transition: transform 0.1s;
                }
                .bp-range::-webkit-slider-thumb:hover {
                    transform: scale(1.25);
                }
                .bp-range::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: var(--fg);
                    border: 2px solid var(--bg);
                    cursor: pointer;
                }
            `}</style>

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
                        Rigid-body physics · three.js
                    </p>
                    <h1 className="font-display text-4xl md:text-6xl text-[var(--fg)] leading-[0.95] mb-3">
                        Ball Pit
                    </h1>
                    <p className="text-sm text-[var(--fg-muted)] leading-relaxed max-w-sm">
                        {count} rigid bodies simulated in real time. Move your
                        cursor to push the field. Open Controls to retune.
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
                            <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">bounce</dt>
                            <dd className="tabular-nums text-[var(--fg)]/70 w-16">{wallBounce.toFixed(2)}</dd>
                        </div>
                        <div className="flex items-baseline justify-end gap-3">
                            <dt className="uppercase tracking-[0.18em] text-[var(--fg)]/40">fps</dt>
                            <dd className="tabular-nums text-[var(--accent)] w-16">{fps}</dd>
                        </div>
                    </dl>
                </div>

                {/* ── Controls drawer ── */}
                <div
                    className={`fixed top-16 right-0 h-[calc(100vh-4rem)] w-full sm:w-96 bg-[var(--bg-elevated)]/98 backdrop-blur-xl border-l border-[var(--hairline)] z-50 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        showControls ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Drawer header */}
                    <div className="flex items-center justify-between px-6 h-16 border-b border-[var(--hairline)] shrink-0">
                        <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">Controls</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleReset}
                                title="Reset to defaults"
                                className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-[var(--fg-dim)] hover:text-[var(--fg)] transition-colors"
                            >
                                <RotateCcw className="w-3 h-3" />
                                Reset
                            </button>
                            <div className="w-px h-4 bg-[var(--hairline)]" />
                            <button
                                onClick={() => setShowControls(false)}
                                className="text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
                                aria-label="Close"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">

                        {/* ── Palette ── */}
                        <section>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-3">Palette</p>
                            <div className="grid grid-cols-3 gap-2">
                                {COLOR_PRESETS.map((preset, i) => (
                                    <button
                                        key={preset.label}
                                        onClick={() => {
                                            setActivePreset(i);
                                            setColors(preset.colors);
                                        }}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded border transition-all ${
                                            activePreset === i
                                                ? 'border-[var(--accent)] bg-[var(--accent)]/8'
                                                : 'border-[var(--hairline)] hover:border-[var(--hairline-strong)]'
                                        }`}
                                    >
                                        <div className="flex gap-0.5">
                                            {preset.swatches.map((s) => (
                                                <span key={s} className="w-3 h-3 rounded-full" style={{ background: s }} />
                                            ))}
                                        </div>
                                        <span className="text-[10px] text-[var(--fg-muted)]">{preset.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="h-px bg-[var(--hairline)]" />

                        {/* ── Ball count ── */}
                        <ControlSlider
                            label="Ball count"
                            value={count}
                            min={10}
                            max={300}
                            step={5}
                            format={(v) => String(v)}
                            onChange={setCount}
                        />

                        {/* ── Gravity ── */}
                        <section className="space-y-3">
                            <ControlSlider
                                label="Gravity"
                                value={gravity}
                                min={0}
                                max={2}
                                step={0.05}
                                format={(v) => v.toFixed(2)}
                                onChange={setGravity}
                            />
                            {/* Quick-set gravity presets */}
                            <div className="grid grid-cols-4 gap-1.5">
                                {GRAVITY_PRESETS.map((gp) => (
                                    <button
                                        key={gp.label}
                                        onClick={() => setGravity(gp.value)}
                                        className={`py-1.5 rounded text-[10px] uppercase tracking-[0.1em] border transition-all ${
                                            Math.abs(gravity - gp.value) < 0.01
                                                ? 'border-[var(--accent)] text-[var(--accent)]'
                                                : 'border-[var(--hairline)] text-[var(--fg-dim)] hover:border-[var(--hairline-strong)] hover:text-[var(--fg-muted)]'
                                        }`}
                                    >
                                        {gp.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* ── Friction ── */}
                        <ControlSlider
                            label="Friction"
                            value={friction}
                            min={0.9}
                            max={1.0}
                            step={0.0005}
                            format={(v) => v.toFixed(4)}
                            onChange={setFriction}
                        />

                        {/* ── Wall bounce ── */}
                        <ControlSlider
                            label="Wall bounce"
                            value={wallBounce}
                            min={0.3}
                            max={1.0}
                            step={0.01}
                            format={(v) => v.toFixed(2)}
                            onChange={setWallBounce}
                        />

                        <div className="h-px bg-[var(--hairline)]" />

                        {/* ── Follow cursor ── */}
                        <section>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    {followCursor
                                        ? <MousePointer className="w-3.5 h-3.5 text-[var(--accent)]" />
                                        : <MousePointer2Off className="w-3.5 h-3.5 text-[var(--fg-dim)]" />
                                    }
                                    <span className="text-sm text-[var(--fg)]">Follow cursor</span>
                                </div>
                                {/* Toggle switch */}
                                <button
                                    onClick={() => setFollowCursor((v) => !v)}
                                    aria-pressed={followCursor}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                                        followCursor
                                            ? 'bg-[var(--accent)]'
                                            : 'bg-[var(--bg-card)] border border-[var(--hairline-strong)]'
                                    }`}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0 w-5 h-5 rounded-full transition-all duration-200 shadow-sm ${
                                            followCursor
                                                ? 'translate-x-5 bg-white'
                                                : 'translate-x-0.5 bg-[var(--fg-muted)]'
                                        }`}
                                    />
                                </button>
                            </div>
                            <p className="text-xs text-[var(--fg-dim)] leading-relaxed">
                                Moves an invisible sphere to your cursor position,
                                pushing balls out of the way. Turn off to let
                                gravity alone drive the simulation.
                            </p>
                        </section>
                    </div>

                    {/* Drawer footer */}
                    <div className="px-6 py-4 border-t border-[var(--hairline)] shrink-0">
                        <p className="font-mono text-[10px] text-[var(--fg-dim)] leading-relaxed">
                            All parameters apply on the next frame — no reload.
                        </p>
                    </div>
                </div>

                {/* Mobile backdrop */}
                {showControls && (
                    <button
                        aria-label="Close controls"
                        onClick={() => setShowControls(false)}
                        className="fixed top-16 inset-x-0 bottom-0 z-40 bg-black/50 sm:hidden"
                    />
                )}
            </div>
        </>
    );
}

// ─── Slider component ─────────────────────────────────────────────────────────

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
    const pct = `${((value - min) / (max - min)) * 100}%`;

    return (
        <div className="space-y-3">
            <div className="flex items-baseline justify-between">
                <span className="text-sm text-[var(--fg)]">{label}</span>
                <span className="font-mono text-xs text-[var(--accent)] tabular-nums">{format(value)}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className="bp-range"
                style={{
                    background: `linear-gradient(to right, var(--accent) ${pct}, rgba(245,241,234,0.1) ${pct})`,
                }}
            />
            <div className="flex justify-between">
                <span className="font-mono text-[9px] text-[var(--fg-dim)]">{min}</span>
                <span className="font-mono text-[9px] text-[var(--fg-dim)]">{max}</span>
            </div>
        </div>
    );
}
