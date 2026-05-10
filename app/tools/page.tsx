'use client';

import { useState } from 'react';
import { Eyebrow, Button } from '@/components/UI';
import { ArrowRight, Copy, Check } from 'lucide-react';
import { splitLength, repeatRows } from '@/lib/utils';

const inputCls =
    'w-full bg-transparent border-0 border-b border-[var(--hairline-strong)] py-2 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--fg-dim)]';

export default function ToolsPage() {
    return (
        <div className="px-6 pt-24 md:pt-32 pb-32">
            <div className="max-w-6xl mx-auto mb-20">
                <Eyebrow className="mb-6">Tools</Eyebrow>
                <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-6 max-w-3xl">
                    Three small utilities I use a lot.
                </h1>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl leading-relaxed">
                    The ones I rewrite from scratch every job because nobody on the
                    team can find the original. Length splitter, row repeater,
                    great-circle distance.
                </p>
            </div>

            <div className="max-w-6xl mx-auto space-y-24">
                <LengthSplitterTool />
                <div className="divider" />
                <RowRepeaterTool />
                <div className="divider" />
                <CoordinateCalculatorTool />
            </div>
        </div>
    );
}

// ─── Length splitter ─────────────────────────────────────────────────────────

function LengthSplitterTool() {
    const [totalLength, setTotalLength] = useState<number>(100);
    const [segmentLength, setSegmentLength] = useState<number>(20);
    const [result, setResult] = useState<number[]>([]);
    const [copied, setCopied] = useState(false);

    const handleCalculate = () => setResult(splitLength(totalLength, segmentLength));
    const handleCopy = () => {
        navigator.clipboard.writeText(result.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <section className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-dim)] mb-3">
                    01 / 03
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-[var(--fg)] leading-tight mb-3">
                    Length splitter.
                </h2>
                <p className="text-[var(--fg-muted)] leading-relaxed">
                    Cut a total length into equal segments. The last one keeps the
                    remainder. Useful for splitting survey runs into Excel rows.
                </p>
            </div>

            <div className="md:col-span-8 space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                    <Field
                        label="Total length"
                        suffix="m"
                        type="number"
                        value={totalLength}
                        onChange={(v) => setTotalLength(Number(v))}
                    />
                    <Field
                        label="Segment length"
                        suffix="m"
                        type="number"
                        value={segmentLength}
                        onChange={(v) => setSegmentLength(Number(v))}
                    />
                </div>

                <Button onClick={handleCalculate} variant="primary">
                    Calculate
                    <ArrowRight className="w-4 h-4" />
                </Button>

                {result.length > 0 && (
                    <ResultBlock
                        label={`${result.length} segments`}
                        onCopy={handleCopy}
                        copied={copied}
                    >
                        {result.map((s, i) => (
                            <div
                                key={i}
                                className="flex items-baseline justify-between py-1.5 border-b border-[var(--hairline)] last:border-0"
                            >
                                <span className="font-mono text-xs text-[var(--fg-dim)] tabular-nums w-8">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="font-mono text-sm text-[var(--fg)] tabular-nums">
                                    {s} m
                                </span>
                            </div>
                        ))}
                    </ResultBlock>
                )}
            </div>
        </section>
    );
}

// ─── Row repeater ────────────────────────────────────────────────────────────

function RowRepeaterTool() {
    const [inputData, setInputData] = useState<string>('Row 1\nRow 2\nRow 3');
    const [repeatCount, setRepeatCount] = useState<number>(2);
    const [result, setResult] = useState<string[]>([]);
    const [copied, setCopied] = useState(false);

    const handleProcess = () => {
        const rows = inputData.split('\n').filter((r) => r.trim());
        setResult(repeatRows(rows, repeatCount));
    };
    const handleCopy = () => {
        navigator.clipboard.writeText(result.join('\n'));
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
    };

    return (
        <section className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-dim)] mb-3">
                    02 / 03
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-[var(--fg)] leading-tight mb-3">
                    Row repeater.
                </h2>
                <p className="text-[var(--fg-muted)] leading-relaxed">
                    Take a list, repeat each row N times. Helpful for expanding
                    chainage labels and aligning sparse data to dense grids.
                </p>
            </div>

            <div className="md:col-span-8 space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                            Rows (one per line)
                        </label>
                        <textarea
                            value={inputData}
                            onChange={(e) => setInputData(e.target.value)}
                            rows={5}
                            className={`${inputCls} resize-none font-mono text-sm`}
                        />
                    </div>
                    <Field
                        label="Repeat each row"
                        suffix="×"
                        type="number"
                        value={repeatCount}
                        onChange={(v) => setRepeatCount(Math.max(1, Number(v)))}
                    />
                </div>

                <Button onClick={handleProcess} variant="primary">
                    Generate
                    <ArrowRight className="w-4 h-4" />
                </Button>

                {result.length > 0 && (
                    <ResultBlock
                        label={`${result.length} rows`}
                        onCopy={handleCopy}
                        copied={copied}
                    >
                        {result.map((row, i) => (
                            <div
                                key={i}
                                className="flex items-baseline gap-4 py-1.5 border-b border-[var(--hairline)] last:border-0"
                            >
                                <span className="font-mono text-xs text-[var(--fg-dim)] tabular-nums w-8">
                                    {String(i + 1).padStart(2, '0')}
                                </span>
                                <span className="font-mono text-sm text-[var(--fg)]">
                                    {row}
                                </span>
                            </div>
                        ))}
                    </ResultBlock>
                )}
            </div>
        </section>
    );
}

// ─── Coordinate calculator ───────────────────────────────────────────────────

function CoordinateCalculatorTool() {
    const [lat1, setLat1] = useState<number>(30.0444);
    const [lon1, setLon1] = useState<number>(31.2357);
    const [lat2, setLat2] = useState<number>(30.0544);
    const [lon2, setLon2] = useState<number>(31.2457);
    const [distance, setDistance] = useState<number | null>(null);

    const calculate = () => {
        const R = 6371000;
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        setDistance(R * c);
    };

    return (
        <section className="grid md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
                <p className="font-mono text-xs uppercase tracking-wider text-[var(--fg-dim)] mb-3">
                    03 / 03
                </p>
                <h2 className="font-display text-3xl md:text-4xl text-[var(--fg)] leading-tight mb-3">
                    Great-circle distance.
                </h2>
                <p className="text-[var(--fg-muted)] leading-relaxed">
                    Two lat/long pairs, one Haversine. Returns metres along the
                    sphere. Default values are points in Cairo.
                </p>
            </div>

            <div className="md:col-span-8 space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                            Point 1
                        </p>
                        <Field
                            label="Latitude"
                            type="number"
                            step="0.000001"
                            value={lat1}
                            onChange={(v) => setLat1(Number(v))}
                        />
                        <Field
                            label="Longitude"
                            type="number"
                            step="0.000001"
                            value={lon1}
                            onChange={(v) => setLon1(Number(v))}
                        />
                    </div>
                    <div className="space-y-6">
                        <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                            Point 2
                        </p>
                        <Field
                            label="Latitude"
                            type="number"
                            step="0.000001"
                            value={lat2}
                            onChange={(v) => setLat2(Number(v))}
                        />
                        <Field
                            label="Longitude"
                            type="number"
                            step="0.000001"
                            value={lon2}
                            onChange={(v) => setLon2(Number(v))}
                        />
                    </div>
                </div>

                <Button onClick={calculate} variant="primary">
                    Calculate
                    <ArrowRight className="w-4 h-4" />
                </Button>

                {distance !== null && (
                    <div className="border-t border-[var(--hairline)] pt-6">
                        <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)] mb-3">
                            Distance
                        </p>
                        <div className="flex items-baseline gap-4 flex-wrap">
                            <span className="font-display text-5xl md:text-6xl text-[var(--accent)] leading-none tabular-nums">
                                {distance.toFixed(2)}
                            </span>
                            <span className="font-mono text-sm text-[var(--fg-dim)]">m</span>
                            <span className="font-mono text-sm text-[var(--fg-muted)]">
                                · {(distance / 1000).toFixed(3)} km
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function Field({
    label,
    value,
    onChange,
    type = 'text',
    suffix,
    step,
}: {
    label: string;
    value: string | number;
    onChange: (v: string) => void;
    type?: string;
    suffix?: string;
    step?: string;
}) {
    return (
        <div className="space-y-2">
            <label className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                {label}
            </label>
            <div className="flex items-baseline gap-2">
                <input
                    type={type}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputCls}
                />
                {suffix && (
                    <span className="font-mono text-xs text-[var(--fg-dim)]">{suffix}</span>
                )}
            </div>
        </div>
    );
}

function ResultBlock({
    label,
    onCopy,
    copied,
    children,
}: {
    label: string;
    onCopy: () => void;
    copied: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="border-t border-[var(--hairline)] pt-6">
            <div className="flex items-baseline justify-between mb-4">
                <p className="text-xs uppercase tracking-wider text-[var(--fg-muted)]">
                    Result · {label}
                </p>
                <button
                    onClick={onCopy}
                    className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--fg-muted)] hover:text-[var(--accent)] transition-colors"
                >
                    {copied ? (
                        <>
                            <Check className="w-3.5 h-3.5" />
                            copied
                        </>
                    ) : (
                        <>
                            <Copy className="w-3.5 h-3.5" />
                            copy
                        </>
                    )}
                </button>
            </div>
            <div className="border border-[var(--hairline)] rounded-md bg-[var(--bg-card)] p-4 max-h-72 overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
