'use client';

import { useState } from 'react';
import { Github, Linkedin, ArrowUpRight, Copy, Check, Mail } from 'lucide-react';
import { Eyebrow } from '@/components/UI';
import { motion } from 'framer-motion';

const EMAIL = 'MohabTohamyAbdallah@gmail.com';

export default function ContactPage() {
    const [copied, setCopied] = useState(false);

    const copy = () => {
        navigator.clipboard.writeText(EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="px-6 pt-24 md:pt-32 pb-32 min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="mb-20"
                >
                    <Eyebrow className="mb-6">Say hi</Eyebrow>
                    <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-8 max-w-2xl">
                        Let's talk.
                    </h1>
                    <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl">
                        Looking for frontend, automation, or full-stack work in Austria.
                        Open to relocation and visa sponsorship.
                    </p>
                </motion.div>

                {/* ── Big email block ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    className="border-t border-[var(--hairline)] pt-12 mb-20"
                >
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-dim)] mb-6">
                        Email — the fastest way
                    </p>

                    <a
                        href={`mailto:${EMAIL}`}
                        className="group block mb-8"
                    >
                        <span className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-[var(--fg)] leading-[1.0] break-all group-hover:text-[var(--accent)] transition-colors duration-300">
                            {EMAIL}
                        </span>
                    </a>

                    <div className="flex flex-wrap items-center gap-3">
                        <a
                            href={`mailto:${EMAIL}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--accent)] text-[var(--bg)] rounded-full text-sm font-medium hover:bg-[var(--accent)]/90 transition-colors"
                        >
                            <Mail className="w-4 h-4" />
                            Open in mail app
                        </a>

                        <button
                            onClick={copy}
                            className="inline-flex items-center gap-2 px-5 py-2.5 border border-[var(--hairline-strong)] text-[var(--fg-muted)] rounded-full text-sm hover:border-[var(--fg)]/30 hover:text-[var(--fg)] transition-all"
                        >
                            {copied ? (
                                <>
                                    <Check className="w-4 h-4 text-[var(--accent)]" />
                                    <span className="text-[var(--accent)]">Copied</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4" />
                                    Copy address
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* ── Info grid ── */}
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                    className="border-t border-[var(--hairline)] pt-12 grid md:grid-cols-3 gap-12"
                >
                    {/* Location */}
                    <div>
                        <Eyebrow className="mb-5">Location</Eyebrow>
                        <p className="text-[var(--fg)] mb-1">Riyadh, Saudi Arabia</p>
                        <p className="text-sm text-[var(--fg-muted)] leading-relaxed">
                            Targeting Austria —<br />Vienna, Linz, St. Pölten
                        </p>
                    </div>

                    {/* Elsewhere */}
                    <div>
                        <Eyebrow className="mb-5">Elsewhere</Eyebrow>
                        <div className="space-y-4">
                            <a
                                href="https://github.com/MohabTohamy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2 text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">
                                    <Github className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">github.com/MohabTohamy</span>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--fg-dim)] group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/mohab-tohamy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2 text-[var(--fg-muted)] group-hover:text-[var(--fg)] transition-colors">
                                    <Linkedin className="w-4 h-4 shrink-0" />
                                    <span className="text-sm">linkedin.com/in/mohab-tohamy</span>
                                </div>
                                <ArrowUpRight className="w-3.5 h-3.5 text-[var(--fg-dim)] group-hover:text-[var(--accent)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                            </a>
                        </div>
                    </div>

                    {/* Open to */}
                    <div>
                        <Eyebrow className="mb-5">Open to</Eyebrow>
                        <ul className="space-y-2.5">
                            {[
                                'Frontend — React / Next.js / TypeScript',
                                'Full-stack web applications',
                                'Python automation & internal tools',
                                'Visa sponsorship & relocation',
                            ].map((item) => (
                                <li key={item} className="flex gap-3 text-sm text-[var(--fg-muted)]">
                                    <span className="text-[var(--accent)] shrink-0 mt-0.5">—</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* ── Availability bar ── */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.35 }}
                    className="border-t border-[var(--hairline)] mt-16 pt-8 flex items-center gap-3"
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--fg-dim)]">
                        Available for new opportunities — 2026
                    </p>
                </motion.div>

            </div>
        </div>
    );
}
