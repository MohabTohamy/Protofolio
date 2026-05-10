'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/UI';
import { experiences, skills } from '@/data/experience';

export default function AboutPage() {
    const skillsByCategory = skills.reduce((acc, s) => {
        if (!acc[s.category]) acc[s.category] = [];
        acc[s.category].push(s);
        return acc;
    }, {} as Record<string, typeof skills>);

    return (
        <>
            {/* Intro */}
            <section className="px-6 pt-24 pb-20 md:pt-32">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">About</Eyebrow>
                    <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-12">
                        Hi. I'm Mohab.
                    </h1>
                    <div className="space-y-5 text-lg text-[var(--fg-muted)] leading-relaxed">
                        <p>
                            I build software that sits between raw data and the
                            people who need to act on it. Most of my work is in
                            pavement and infrastructure engineering — survey machines
                            that produce gigabytes of messy output, and the tools that
                            turn it into something usable.
                        </p>
                        <p>
                            On the frontend, that's React, Next.js, and TypeScript —
                            dashboards, GIS interfaces, internal tools. I handle
                            deployment too, mostly to IIS servers because that's what
                            enterprise customers run.
                        </p>
                        <p>
                            On the automation side, I write Python: standalone EXE
                            tools that field engineers can use without touching code,
                            AI-driven desktop automation, batch data validation.
                            Practical stuff that replaces weeks of manual work.
                        </p>
                        <p className="text-[var(--fg)]">
                            I'm moving to Austria in 2026. My closest friends grew up
                            there and live in St. Pölten now — that's the real
                            reason. The professional one is that the engineering
                            software scene in Austria is genuinely good, and I want
                            to be part of it.
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6">
                <div className="divider" />
            </div>

            {/* Experience */}
            <section className="px-6 py-24">
                <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <Eyebrow>Experience</Eyebrow>
                        <p className="text-[var(--fg-muted)] mt-3 max-w-xs text-sm">
                            Three jobs in three years. Each one taught me something I
                            still use.
                        </p>
                    </div>
                    <div className="md:col-span-8 space-y-12">
                        {experiences.map((exp, i) => (
                            <motion.div
                                key={exp.id}
                                initial={{ opacity: 0, y: 16 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: '-30px' }}
                                transition={{ delay: i * 0.05 }}
                                className="border-l border-[var(--hairline)] pl-6"
                            >
                                <p className="font-mono text-xs text-[var(--fg-dim)] mb-3 uppercase tracking-wider">
                                    {exp.period}
                                </p>
                                <h3 className="font-display text-2xl md:text-3xl text-[var(--fg)] mb-1 leading-tight">
                                    {exp.title}
                                </h3>
                                <p className="text-[var(--fg-muted)] mb-5">
                                    {exp.company}
                                </p>
                                <p className="text-[var(--fg-muted)] leading-relaxed mb-5">
                                    {exp.description}
                                </p>
                                <ul className="space-y-2 mb-5">
                                    {exp.achievements.map((a, j) => (
                                        <li
                                            key={j}
                                            className="text-sm text-[var(--fg-muted)] flex gap-3 leading-relaxed"
                                        >
                                            <span className="text-[var(--accent)] shrink-0">—</span>
                                            <span>{a}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="font-mono text-xs text-[var(--fg-dim)]">
                                    {exp.technologies.join('  ·  ')}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6">
                <div className="divider" />
            </div>

            {/* Skills */}
            <section className="px-6 py-24">
                <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12">
                    <div className="md:col-span-4">
                        <Eyebrow>Skills</Eyebrow>
                        <p className="text-[var(--fg-muted)] mt-3 max-w-xs text-sm">
                            Numbers are how comfortable I am building from scratch in
                            production today. Honest, not aspirational.
                        </p>
                    </div>
                    <div className="md:col-span-8 space-y-10">
                        {Object.entries(skillsByCategory).map(([category, list]) => (
                            <div key={category}>
                                <h3 className="font-display text-xl text-[var(--fg)] mb-4">
                                    {category}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1">
                                    {list.map((s) => (
                                        <div
                                            key={s.name}
                                            className="flex items-baseline justify-between border-b border-[var(--hairline)] py-3"
                                        >
                                            <span className="text-sm text-[var(--fg)]">
                                                {s.name}
                                            </span>
                                            <span className="font-mono text-xs text-[var(--fg-dim)] tabular-nums">
                                                {s.level}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-6">
                <div className="divider" />
            </div>

            {/* CTA */}
            <section className="px-6 py-24">
                <div className="max-w-3xl mx-auto">
                    <Eyebrow className="mb-6">Next</Eyebrow>
                    <p className="font-display text-3xl md:text-4xl text-[var(--fg)] leading-tight mb-8">
                        If any of this lines up with what you're hiring for, I'd
                        love to talk.
                    </p>
                    <Link href="/contact" className="link-arrow text-lg">
                        Get in touch
                        <ArrowUpRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </>
    );
}
