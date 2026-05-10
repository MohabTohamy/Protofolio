'use client';

import { useState } from 'react';
import { Github, Linkedin, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Eyebrow, Button } from '@/components/UI';

export default function ContactPage() {
    const [data, setData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const body = `Name: ${data.name}\nEmail: ${data.email}\n\n${data.message}`;
        window.location.href = `mailto:MohabTohamyAbdallah@gmail.com?subject=${encodeURIComponent(
            data.subject
        )}&body=${encodeURIComponent(body)}`;
    };

    const change = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const inputCls =
        'w-full bg-transparent border-0 border-b border-[var(--hairline-strong)] py-3 text-[var(--fg)] focus:outline-none focus:border-[var(--accent)] transition-colors placeholder:text-[var(--fg-dim)]';

    return (
        <div className="px-6 pt-24 md:pt-32 pb-32">
            <div className="max-w-3xl mx-auto mb-16">
                <Eyebrow className="mb-6">Say hi</Eyebrow>
                <h1 className="font-display text-5xl md:text-7xl text-[var(--fg)] leading-[0.98] mb-8">
                    Let's talk.
                </h1>
                <p className="text-lg text-[var(--fg-muted)] leading-relaxed max-w-xl">
                    Looking for frontend, automation, or full-stack work in
                    Austria. Open to relocation and visa sponsorship. The fastest
                    way to reach me is email — but the form below works too.
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid md:grid-cols-12 gap-12 mb-20">
                {/* Direct contact */}
                <div className="md:col-span-5 space-y-10">
                    <div>
                        <Eyebrow className="mb-4">Direct</Eyebrow>
                        <a
                            href="mailto:MohabTohamyAbdallah@gmail.com"
                            className="block group"
                        >
                            <p className="font-display text-2xl md:text-3xl text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors break-all leading-tight">
                                MohabTohamyAbdallah@gmail.com
                            </p>
                        </a>
                    </div>

                    <div>
                        <Eyebrow className="mb-4">Elsewhere</Eyebrow>
                        <div className="space-y-3">
                            <a
                                href="https://github.com/MohabTohamy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-arrow text-base"
                            >
                                <Github className="w-4 h-4" />
                                github.com/MohabTohamy
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                            <br />
                            <a
                                href="https://www.linkedin.com/in/mohab-tohamy/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link-arrow text-base"
                            >
                                <Linkedin className="w-4 h-4" />
                                linkedin.com/in/mohab-tohamy
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <Eyebrow className="mb-4">Location</Eyebrow>
                        <p className="text-[var(--fg)]">Riyadh, Saudi Arabia</p>
                        <p className="text-[var(--fg-muted)] text-sm mt-1">
                            Targeting Austria — Vienna, Linz, St. Pölten
                        </p>
                    </div>

                    <div>
                        <Eyebrow className="mb-4">Open to</Eyebrow>
                        <ul className="space-y-2 text-sm text-[var(--fg-muted)]">
                            <li className="flex gap-3">
                                <span className="text-[var(--accent)] shrink-0">—</span>
                                Frontend (React / Next.js / TypeScript)
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[var(--accent)] shrink-0">—</span>
                                Full-stack web applications
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[var(--accent)] shrink-0">—</span>
                                Python automation & internal tools
                            </li>
                            <li className="flex gap-3">
                                <span className="text-[var(--accent)] shrink-0">—</span>
                                Visa sponsorship & relocation
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Form */}
                <form
                    onSubmit={submit}
                    className="md:col-span-7 space-y-6 self-start"
                >
                    <Eyebrow>Or send a message</Eyebrow>

                    <div>
                        <label
                            htmlFor="name"
                            className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mb-2"
                        >
                            Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={data.name}
                            onChange={change}
                            required
                            className={inputCls}
                            placeholder="Your name"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mb-2"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={data.email}
                            onChange={change}
                            required
                            className={inputCls}
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="subject"
                            className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mb-2"
                        >
                            Subject
                        </label>
                        <input
                            id="subject"
                            name="subject"
                            type="text"
                            value={data.subject}
                            onChange={change}
                            required
                            className={inputCls}
                            placeholder="What's this about?"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="message"
                            className="block text-xs uppercase tracking-wider text-[var(--fg-muted)] mb-2"
                        >
                            Message
                        </label>
                        <textarea
                            id="message"
                            name="message"
                            value={data.message}
                            onChange={change}
                            required
                            rows={5}
                            className={`${inputCls} resize-none`}
                            placeholder="Tell me about the role, your team, or just say hi."
                        />
                    </div>

                    <Button type="submit" variant="primary">
                        Send <ArrowRight className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
