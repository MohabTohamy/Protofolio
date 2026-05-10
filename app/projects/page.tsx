'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, ArrowUpRight, Plus, Minus } from 'lucide-react';
import Link from 'next/link';
import { Eyebrow } from '@/components/UI';
import { projects, categories } from '@/data/projects';

export default function ProjectsPage() {
    const [filter, setFilter] = useState<string>('All');
    const [openId, setOpenId] = useState<string | null>(null);

    const list =
        filter === 'All'
            ? projects
            : projects.filter((p) => p.category === filter);

    return (
        <div className="px-6 pt-24 md:pt-32 pb-32">
            <div className="max-w-6xl mx-auto">
                <Eyebrow className="mb-6">
                    Work · {projects.length} projects
                </Eyebrow>
                <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-12 max-w-3xl">
                    Things I've built.
                </h1>

                {/* Filter pills */}
                <div className="flex flex-wrap gap-2 mb-16">
                    {categories.map((cat) => {
                        const active = filter === cat;
                        const count =
                            cat === 'All'
                                ? projects.length
                                : projects.filter((p) => p.category === cat).length;
                        return (
                            <button
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-full text-sm transition-all ${active
                                    ? 'bg-[var(--accent)] text-[var(--bg)]'
                                    : 'border border-[var(--hairline-strong)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg)]'
                                    }`}
                            >
                                {cat}
                                <span className="opacity-60 ml-2 font-mono text-xs">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* List */}
                <ul className="border-t border-[var(--hairline)]">
                    <AnimatePresence mode="popLayout" initial={false}>
                        {list.map((p, i) => {
                            const isOpen = openId === p.id;
                            return (
                                <motion.li
                                    key={p.id}
                                    layout
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.25, delay: i * 0.03 }}
                                    className="border-b border-[var(--hairline)]"
                                >
                                    <button
                                        onClick={() =>
                                            setOpenId(isOpen ? null : p.id)
                                        }
                                        className="w-full grid grid-cols-12 gap-4 py-6 items-baseline text-left hover:bg-[var(--bg-elevated)]/40 -mx-4 px-4 rounded-md transition-colors group"
                                        aria-expanded={isOpen}
                                    >
                                        <span className="col-span-2 md:col-span-1 font-mono text-sm text-[var(--fg-dim)] tabular-nums self-center">
                                            {String(i + 1).padStart(2, '0')}
                                        </span>
                                        <span className="col-span-8 md:col-span-7 font-display text-xl md:text-2xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors leading-snug">
                                            {p.title}
                                        </span>
                                        <span className="hidden md:block md:col-span-3 text-sm text-[var(--fg-muted)] self-center">
                                            {p.category}
                                        </span>
                                        <span className="col-span-2 md:col-span-1 flex justify-end self-center text-[var(--fg-dim)] group-hover:text-[var(--accent)] transition-colors">
                                            {isOpen ? (
                                                <Minus className="w-5 h-5" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </span>
                                    </button>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="grid md:grid-cols-12 gap-4 pb-8">
                                                    <div className="md:col-start-2 md:col-span-7">
                                                        <p className="text-[var(--fg-muted)] leading-relaxed mb-5">
                                                            {p.longDescription}
                                                        </p>
                                                        <div className="flex flex-wrap gap-2 mb-5">
                                                            {p.technologies.map((t) => (
                                                                <span
                                                                    key={t}
                                                                    className="font-mono text-xs px-2.5 py-1 border border-[var(--hairline-strong)] rounded-full text-[var(--fg-muted)]"
                                                                >
                                                                    {t}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <div className="flex gap-5 text-sm">
                                                            {p.github && (
                                                                <a
                                                                    href={p.github}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="link-arrow"
                                                                >
                                                                    <Github className="w-4 h-4" />
                                                                    Code
                                                                </a>
                                                            )}
                                                            {p.demo &&
                                                                (p.demo.startsWith('http') ? (
                                                                    <a
                                                                        href={p.demo}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="link-arrow"
                                                                    >
                                                                        Live demo
                                                                        <ArrowUpRight className="w-4 h-4" />
                                                                    </a>
                                                                ) : (
                                                                    <Link
                                                                        href={p.demo}
                                                                        className="link-arrow"
                                                                    >
                                                                        Live demo
                                                                        <ArrowUpRight className="w-4 h-4" />
                                                                    </Link>
                                                                ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.li>
                            );
                        })}
                    </AnimatePresence>
                </ul>

                {list.length === 0 && (
                    <p className="text-center py-16 text-[var(--fg-muted)]">
                        Nothing here in this category.
                    </p>
                )}
            </div>
        </div>
    );
}
