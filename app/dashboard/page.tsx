'use client';

import { Eyebrow } from '@/components/UI';
import {
    dashboardStats,
    frictionDistribution,
    crackDensityData,
    coverageData,
} from '@/data/mapData';
import {
    BarChart,
    Bar,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

// Editorial chart theme
const TICK = { fill: '#A39D8F', fontSize: 11, fontFamily: 'var(--font-jetbrains-mono)' };
const AXIS = { stroke: '#3a352b' };
const GRID = '#2a261f';
const TOOLTIP_STYLE = {
    backgroundColor: '#15140F',
    border: '1px solid rgba(245, 241, 234, 0.16)',
    borderRadius: '6px',
    color: '#F5F1EA',
    fontFamily: 'var(--font-jetbrains-mono)',
    fontSize: '12px',
};
const TOOLTIP_ITEM_STYLE = { color: '#F5F1EA' };
const TOOLTIP_LABEL_STYLE = { color: '#A39D8F', fontSize: '10px', textTransform: 'uppercase' as const, letterSpacing: '0.1em' };

export default function DashboardPage() {
    return (
        <div className="px-6 pt-24 md:pt-32 pb-32">
            <div className="max-w-6xl mx-auto">
                <Eyebrow className="mb-6">Analytics</Eyebrow>
                <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-6 max-w-3xl">
                    Numbers from the field.
                </h1>
                <p className="text-lg text-[var(--fg-muted)] max-w-2xl leading-relaxed mb-16">
                    Synthetic pavement-survey data, visualized the way the real
                    dashboards do it. Friction, crack density, coverage, quality —
                    plus the four sensor families behind every number.
                </p>

                {/* Stats — editorial row */}
                <ul className="border-t border-[var(--hairline)] mb-20">
                    {[
                        {
                            label: 'Total road length',
                            value: `${dashboardStats.totalRoadLength.toLocaleString()}`,
                            unit: 'm',
                            change: '+12%',
                            positive: true,
                        },
                        {
                            label: 'Average friction',
                            value: dashboardStats.averageFriction.toFixed(2),
                            unit: 'μ',
                            change: '−3%',
                            positive: false,
                        },
                        {
                            label: 'Crack density',
                            value: dashboardStats.averageCrackDensity.toFixed(1),
                            unit: 'm/m²',
                            change: '+5%',
                            positive: true,
                        },
                        {
                            label: 'Sections analysed',
                            value: dashboardStats.sectionsAnalyzed.toString(),
                            unit: '',
                            change: '+2',
                            positive: true,
                        },
                    ].map((s) => (
                        <li
                            key={s.label}
                            className="grid grid-cols-12 gap-4 items-baseline py-6 border-b border-[var(--hairline)]"
                        >
                            <span className="col-span-12 md:col-span-4 text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                                {s.label}
                            </span>
                            <span className="col-span-8 md:col-span-6 font-display text-4xl md:text-5xl text-[var(--fg)] leading-none">
                                {s.value}
                                {s.unit && (
                                    <span className="font-mono text-sm text-[var(--fg-dim)] ml-2 align-middle">
                                        {s.unit}
                                    </span>
                                )}
                            </span>
                            <span
                                className={`col-span-4 md:col-span-2 text-right font-mono text-sm tabular-nums ${s.positive ? 'text-[var(--accent)]' : 'text-[var(--fg-dim)]'
                                    }`}
                            >
                                {s.change}
                            </span>
                        </li>
                    ))}
                </ul>

                {/* Two charts side-by-side */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    <ChartBlock
                        eyebrow="Friction · histogram"
                        title="How the road grips."
                        subtitle="Friction values bucketed across the network. Lower values mean rework — usually the wet-weather problem segments."
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={frictionDistribution}>
                                <CartesianGrid strokeDasharray="2 4" stroke={GRID} />
                                <XAxis dataKey="range" {...AXIS} tick={TICK} />
                                <YAxis {...AXIS} tick={TICK} />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    itemStyle={TOOLTIP_ITEM_STYLE}
                                    labelStyle={TOOLTIP_LABEL_STYLE}
                                    cursor={{ fill: 'rgba(232, 112, 79, 0.06)' }}
                                />
                                <Bar dataKey="count" fill="#E8704F" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBlock>

                    <ChartBlock
                        eyebrow="Cracks · density"
                        title="How much it's failing."
                        subtitle="Crack density in metres of crack per square metre of pavement. Right tail is the truly tired sections."
                    >
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={crackDensityData}>
                                <CartesianGrid strokeDasharray="2 4" stroke={GRID} />
                                <XAxis dataKey="density" {...AXIS} tick={TICK} />
                                <YAxis {...AXIS} tick={TICK} />
                                <Tooltip
                                    contentStyle={TOOLTIP_STYLE}
                                    itemStyle={TOOLTIP_ITEM_STYLE}
                                    labelStyle={TOOLTIP_LABEL_STYLE}
                                    cursor={{ fill: 'rgba(122, 196, 217, 0.06)' }}
                                />
                                <Bar dataKey="count" fill="#7AC4D9" radius={[2, 2, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartBlock>
                </div>

                {/* Coverage line chart */}
                <ChartBlock
                    eyebrow="Coverage · time series"
                    title="How fast we surveyed."
                    subtitle="Cumulative road length covered, month by month. Spikes are the big mobilisation weeks."
                    className="mb-20"
                >
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={coverageData}>
                            <CartesianGrid strokeDasharray="2 4" stroke={GRID} />
                            <XAxis dataKey="month" {...AXIS} tick={TICK} />
                            <YAxis {...AXIS} tick={TICK} />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                itemStyle={TOOLTIP_ITEM_STYLE}
                                labelStyle={TOOLTIP_LABEL_STYLE}
                                cursor={{ stroke: '#E8704F', strokeWidth: 1, strokeDasharray: '3 3' }}
                            />
                            <Line
                                type="monotone"
                                dataKey="length"
                                stroke="#E8704F"
                                strokeWidth={2}
                                dot={{ fill: '#E8704F', r: 3, strokeWidth: 0 }}
                                activeDot={{ fill: '#E8B14F', r: 5, strokeWidth: 0 }}
                                name="Road length (m)"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartBlock>

                {/* Bottom three columns — editorial */}
                <div className="grid md:grid-cols-3 gap-12 border-t border-[var(--hairline)] pt-16">
                    <div>
                        <Eyebrow className="mb-5">Sensor stack</Eyebrow>
                        <ul className="space-y-2">
                            {[
                                { name: 'LCMS', detail: 'Laser crack measurement' },
                                { name: 'CFT', detail: 'Continuous friction tester' },
                                { name: 'FWD', detail: 'Falling weight deflectometer' },
                                { name: 'GPR', detail: 'Ground-penetrating radar' },
                            ].map((s) => (
                                <li
                                    key={s.name}
                                    className="flex items-baseline justify-between border-b border-[var(--hairline)] py-2"
                                >
                                    <span className="text-sm text-[var(--fg)]">{s.name}</span>
                                    <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--fg-dim)]">
                                        {s.detail}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <Eyebrow className="mb-5">Data quality</Eyebrow>
                        <ul className="space-y-4">
                            <QualityRow label="Completeness" value={95} />
                            <QualityRow label="Accuracy" value={92} />
                            <QualityRow label="Consistency" value={88} />
                        </ul>
                    </div>

                    <div>
                        <Eyebrow className="mb-5">Activity</Eyebrow>
                        <ul className="space-y-3">
                            {[
                                'CFT data processed',
                                'LCMS analysis completed',
                                'Reports generated',
                                'Data exported to GeoJSON',
                            ].map((a) => (
                                <li
                                    key={a}
                                    className="text-sm text-[var(--fg-muted)] flex gap-3"
                                >
                                    <span className="text-[var(--accent)] shrink-0">—</span>
                                    <span>{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChartBlock({
    eyebrow,
    title,
    subtitle,
    children,
    className = '',
}: {
    eyebrow: string;
    title: string;
    subtitle: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <Eyebrow className="mb-3">{eyebrow}</Eyebrow>
            <h3 className="font-display text-2xl md:text-3xl text-[var(--fg)] leading-tight mb-2">
                {title}
            </h3>
            <p className="text-sm text-[var(--fg-muted)] mb-6 max-w-md">{subtitle}</p>
            <div className="border border-[var(--hairline)] rounded-lg bg-[var(--bg-card)] p-4">
                {children}
            </div>
        </div>
    );
}

function QualityRow({ label, value }: { label: string; value: number }) {
    return (
        <li>
            <div className="flex items-baseline justify-between mb-2">
                <span className="text-sm text-[var(--fg)]">{label}</span>
                <span className="font-mono text-xs text-[var(--fg-dim)] tabular-nums">
                    {value}
                </span>
            </div>
            <div className="h-px bg-[var(--hairline)] relative overflow-hidden">
                <div
                    className="absolute left-0 top-0 h-full bg-[var(--accent)] transition-[width] duration-700"
                    style={{ width: `${value}%` }}
                />
            </div>
        </li>
    );
}
