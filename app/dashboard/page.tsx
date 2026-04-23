'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { TrendingUp, MapPin, Activity, Layers, ArrowUpRight, ArrowDownRight, Gauge, Zap } from 'lucide-react';
import {
    dashboardStats,
    frictionDistribution,
    crackDensityData,
    coverageData,
} from '@/data/mapData';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    RadialBarChart,
    RadialBar,
} from 'recharts';

// ── Animated number counter ───────────────────────────────────────────────
function useCounter(target: number, duration = 1500) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true });
    useEffect(() => {
        if (!inView) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, target, duration]);
    return { count, ref };
}

// ── Stat card ─────────────────────────────────────────────────────────────
interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: number;
    display: (n: number) => string;
    change: string;
    positive: boolean;
    gradient: string;
    delay: number;
}

function StatCard({ icon, title, value, display, change, positive, gradient, delay }: StatCardProps) {
    const { count, ref } = useCounter(value);
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/4 backdrop-blur-md p-6 group cursor-default"
        >
            {/* Glow blob */}
            <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-35 transition-opacity duration-500 ${gradient}`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                    <div className={`p-3 rounded-xl ${gradient} bg-opacity-20`}>
                        {icon}
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${positive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                        {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {change}
                    </span>
                </div>
                <p className="text-xs font-medium text-white/50 uppercase tracking-widest mb-2">{title}</p>
                <p className="text-3xl font-bold text-white tracking-tight">
                    <span ref={ref}>{display(count)}</span>
                </p>
            </div>
        </motion.div>
    );
}

// ── Custom tooltip ─────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label, color = '#6366f1' }: {
    active?: boolean; payload?: { value: number }[]; label?: string; color?: string;
}) {
    if (!active || !payload?.length) return null;
    return (
        <div className="rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur px-4 py-3 text-sm shadow-xl">
            <p className="text-white/50 mb-1">{label}</p>
            <p className="font-bold" style={{ color }}>{payload[0].value}</p>
        </div>
    );
}

// ── Quality radial bars ───────────────────────────────────────────────────
const qualityData = [
    { name: 'Completeness', value: 95, fill: '#6366f1' },
    { name: 'Accuracy', value: 92, fill: '#22d3ee' },
    { name: 'Consistency', value: 88, fill: '#a78bfa' },
];

// ── Main page ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-[#080c14] text-white">
            {/* Header */}
            <div className="px-6 pt-24 pb-10 max-w-7xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-white/40 uppercase tracking-widest font-medium">Live Data</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                        Infrastructure{' '}
                        <span className="bg-linear-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Analytics
                        </span>
                    </h1>
                    <p className="text-white/40 text-base">Road condition monitoring · Survey data · Quality metrics</p>
                </motion.div>
            </div>

            <div className="px-6 pb-16 max-w-7xl mx-auto space-y-8">

                {/* ── KPI Cards ── */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        icon={<MapPin className="w-5 h-5 text-indigo-300" />}
                        title="Total Road Length"
                        value={dashboardStats.totalRoadLength}
                        display={(n) => `${n.toLocaleString()} m`}
                        change="12%"
                        positive={true}
                        gradient="bg-indigo-500"
                        delay={0}
                    />
                    <StatCard
                        icon={<Gauge className="w-5 h-5 text-cyan-300" />}
                        title="Avg Friction"
                        value={Math.round(dashboardStats.averageFriction * 100)}
                        display={(n) => `0.${n.toString().padStart(2, '0')}`}
                        change="3%"
                        positive={false}
                        gradient="bg-cyan-500"
                        delay={0.1}
                    />
                    <StatCard
                        icon={<Activity className="w-5 h-5 text-violet-300" />}
                        title="Crack Density"
                        value={Math.round(dashboardStats.averageCrackDensity * 10)}
                        display={(n) => `${(n / 10).toFixed(1)} m/m²`}
                        change="5%"
                        positive={false}
                        gradient="bg-violet-500"
                        delay={0.2}
                    />
                    <StatCard
                        icon={<Layers className="w-5 h-5 text-emerald-300" />}
                        title="Sections Analyzed"
                        value={dashboardStats.sectionsAnalyzed}
                        display={(n) => n.toString()}
                        change="2 new"
                        positive={true}
                        gradient="bg-emerald-500"
                        delay={0.3}
                    />
                </div>

                {/* ── Coverage + Friction row ── */}
                <div className="grid xl:grid-cols-3 gap-4">
                    {/* Area chart — coverage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="xl:col-span-2 rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-base font-semibold text-white">Survey Coverage</h3>
                                <p className="text-xs text-white/40 mt-0.5">Road length surveyed per month (m)</p>
                            </div>
                            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                                <TrendingUp className="w-3.5 h-3.5" /> +128% YTD
                            </span>
                        </div>
                        <ResponsiveContainer width="100%" height={240}>
                            <AreaChart data={coverageData} style={{ WebkitTapHighlightColor: 'transparent' }}>
                                <defs>
                                    <linearGradient id="coverageGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis dataKey="month" stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip color="#818cf8" />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4', strokeOpacity: 0.5 }} animationDuration={200} />
                                <Area type="monotone" dataKey="length" stroke="#6366f1" strokeWidth={2.5} fill="url(#coverageGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a5b4fc', strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Radial quality */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 }}
                        className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6 flex flex-col"
                    >
                        <h3 className="text-base font-semibold text-white mb-1">Data Quality</h3>
                        <p className="text-xs text-white/40 mb-4">Validation scores</p>
                        <div className="flex-1 flex items-center justify-center" style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}>
                            <ResponsiveContainer width="100%" height={180}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="90%" data={qualityData} startAngle={90} endAngle={-270} style={{ outline: 'none', cursor: 'default' }}>
                                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#ffffff08' }} isAnimationActive={false} />
                                    <Tooltip content={({ active, payload }) => active && payload?.length ? (
                                        <div className="rounded-xl border border-white/10 bg-slate-900/90 px-3 py-2 text-xs">
                                            <p className="text-white/50">{payload[0].payload.name}</p>
                                            <p className="font-bold text-white">{payload[0].value}%</p>
                                        </div>
                                    ) : null} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-2 mt-2">
                            {qualityData.map((d) => (
                                <div key={d.name} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full" style={{ background: d.fill }} />
                                        <span className="text-white/60">{d.name}</span>
                                    </div>
                                    <span className="font-semibold text-white">{d.value}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* ── Bar charts row ── */}
                <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6"
                    >
                        <h3 className="text-base font-semibold text-white mb-1">Friction Distribution</h3>
                        <p className="text-xs text-white/40 mb-6">Section count by friction range</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={frictionDistribution} barCategoryGap="35%" style={{ WebkitTapHighlightColor: 'transparent' }}>
                                <defs>
                                    <linearGradient id="frictionGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#4338ca" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis dataKey="range" stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip color="#818cf8" />} cursor={false} />
                                <Bar dataKey="count" fill="url(#frictionGrad)" radius={[6, 6, 0, 0]} activeBar={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6"
                    >
                        <h3 className="text-base font-semibold text-white mb-1">Crack Density</h3>
                        <p className="text-xs text-white/40 mb-6">Section count by density band (m/m²)</p>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={crackDensityData} barCategoryGap="35%" style={{ WebkitTapHighlightColor: 'transparent' }}>
                                <defs>
                                    <linearGradient id="crackGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" />
                                        <stop offset="100%" stopColor="#0e7490" />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" vertical={false} />
                                <XAxis dataKey="density" stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#ffffff20" tick={{ fill: '#ffffff50', fontSize: 11 }} axisLine={false} tickLine={false} />
                                <Tooltip content={<ChartTooltip color="#22d3ee" />} cursor={false} />
                                <Bar dataKey="count" fill="url(#crackGrad)" radius={[6, 6, 0, 0]} activeBar={false} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* ── Bottom row — technologies + activity ── */}
                <div className="grid md:grid-cols-2 gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                        className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6"
                    >
                        <h3 className="text-base font-semibold text-white mb-5">Survey Technologies</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { name: 'LCMS', desc: 'Laser Crack Measurement', color: 'from-indigo-500/20 to-indigo-500/5', dot: 'bg-indigo-400' },
                                { name: 'CFT', desc: 'Continuous Friction Tester', color: 'from-cyan-500/20 to-cyan-500/5', dot: 'bg-cyan-400' },
                                { name: 'FWD', desc: 'Falling Weight Deflectometer', color: 'from-violet-500/20 to-violet-500/5', dot: 'bg-violet-400' },
                                { name: 'GPR', desc: 'Ground Penetrating Radar', color: 'from-emerald-500/20 to-emerald-500/5', dot: 'bg-emerald-400' },
                            ].map((t) => (
                                <div key={t.name} className={`rounded-xl p-4 bg-linear-to-br ${t.color} border border-white/5`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                                        <span className="text-sm font-bold text-white">{t.name}</span>
                                    </div>
                                    <p className="text-[11px] text-white/40 leading-tight">{t.desc}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl border border-white/10 bg-white/3 backdrop-blur-md p-6"
                    >
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-semibold text-white">Recent Activity</h3>
                            <Zap className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { label: 'CFT data processed', time: '2 min ago', color: 'bg-cyan-400' },
                                { label: 'LCMS analysis completed', time: '14 min ago', color: 'bg-indigo-400' },
                                { label: 'FWD deflection report ready', time: '1 hr ago', color: 'bg-violet-400' },
                                { label: 'GPR export generated', time: '3 hrs ago', color: 'bg-emerald-400' },
                                { label: 'Dashboard data refreshed', time: '5 hrs ago', color: 'bg-white/30' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                                    className="flex items-center gap-3 group"
                                >
                                    <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.color}`} />
                                    <p className="text-sm text-white/70 flex-1 group-hover:text-white transition-colors">{item.label}</p>
                                    <span className="text-[11px] text-white/30">{item.time}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
}
