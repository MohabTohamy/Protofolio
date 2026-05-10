'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const nav = [
    { label: 'work', href: '/projects' },
    { label: 'tools', href: '/tools' },
    { label: 'map', href: '/map-demo' },
    { label: 'dashboard', href: '/dashboard' },
    { label: '3d lab', href: '/three-lab' },
    { label: 'about', href: '/about' },
    { label: 'say hi', href: '/contact' },
];

export default function Navigation() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <nav className="fixed top-0 inset-x-0 z-50 border-b border-[var(--hairline)] bg-[var(--bg)]/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="font-display text-xl text-[var(--fg)] hover:text-[var(--accent)] transition-colors">
                        Mohab Tohamy
                    </Link>

                    {/* Desktop */}
                    <div className="hidden md:flex items-center text-sm">
                        {nav.map((item, i) => {
                            const active = pathname === item.href;
                            return (
                                <span key={item.href} className="flex items-center">
                                    {i > 0 && (
                                        <span className="text-[var(--fg-dim)] mx-2 select-none">·</span>
                                    )}
                                    <Link
                                        href={item.href}
                                        className={`relative px-1 py-1 transition-colors ${active
                                            ? 'text-[var(--accent)]'
                                            : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                                            }`}
                                    >
                                        {item.label}
                                        {active && (
                                            <motion.span
                                                layoutId="nav-active"
                                                className="absolute -bottom-1 left-0 right-0 h-px bg-[var(--accent)]"
                                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                </span>
                            );
                        })}
                    </div>

                    <button
                        className="md:hidden p-2 -mr-2 text-[var(--fg)]"
                        onClick={() => setOpen(!open)}
                        aria-label="Toggle menu"
                    >
                        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="md:hidden border-t border-[var(--hairline)] overflow-hidden bg-[var(--bg)]/95 backdrop-blur-md"
                    >
                        <div className="px-6 py-4 flex flex-col">
                            {nav.map((item) => {
                                const active = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`py-3 text-base border-b border-[var(--hairline)] last:border-b-0 ${active
                                            ? 'text-[var(--accent)]'
                                            : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
                                            }`}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
}
