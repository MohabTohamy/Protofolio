'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    narrow?: boolean;
}

export function Section({ children, className = '', id, narrow = false }: SectionProps) {
    const max = narrow ? 'max-w-3xl' : 'max-w-6xl';
    return (
        <section id={id} className={`py-20 px-6 ${className}`}>
            <div className={`${max} mx-auto`}>{children}</div>
        </section>
    );
}

interface SectionTitleProps {
    children: ReactNode;
    eyebrow?: string;
    subtitle?: string;
    align?: 'left' | 'center';
}

export function SectionTitle({
    children,
    eyebrow,
    subtitle,
    align = 'left',
}: SectionTitleProps) {
    return (
        <div className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
            {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
            <h2 className="font-display text-4xl md:text-5xl text-[var(--fg)] leading-tight">
                {children}
            </h2>
            {subtitle && (
                <p className="text-[var(--fg-muted)] text-lg mt-4 max-w-2xl">
                    {subtitle}
                </p>
            )}
        </div>
    );
}

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
    return (
        <div
            className={`card-editorial p-6 ${hover ? 'hover:-translate-y-0.5' : ''} ${className}`}
        >
            {children}
        </div>
    );
}

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'ghost' | 'link' | 'secondary' | 'outline';
    href?: string;
    onClick?: () => void;
    className?: string;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, string> = {
    primary:
        'px-5 py-2.5 rounded-full bg-[var(--accent)] text-[var(--bg)] hover:bg-[var(--accent-dim)]',
    secondary:
        'px-5 py-2.5 rounded-full bg-[var(--fg)] text-[var(--bg)] hover:bg-[var(--fg-muted)]',
    ghost:
        'px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-[var(--fg)] hover:border-[var(--fg)] hover:bg-[var(--fg)]/5',
    outline:
        'px-5 py-2.5 rounded-full border border-[var(--hairline-strong)] text-[var(--fg)] hover:border-[var(--fg)] hover:bg-[var(--fg)]/5',
    link:
        'text-[var(--fg)] hover:text-[var(--accent)] underline underline-offset-4 decoration-[var(--hairline-strong)] hover:decoration-[var(--accent)]',
};

export function Button({
    children,
    variant = 'primary',
    href,
    onClick,
    className = '',
    fullWidth = false,
    type = 'button',
    disabled = false,
}: ButtonProps) {
    const base =
        'inline-flex items-center justify-center gap-2 text-sm font-medium transition-all duration-200';
    const disabledCls = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
    const cls = `${base} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${disabledCls} ${className}`;

    if (href) {
        const isExternal =
            href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#');
        if (isExternal) {
            return (
                <a
                    href={href}
                    className={cls}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                    {children}
                </a>
            );
        }
        return (
            <Link href={href} className={cls}>
                {children}
            </Link>
        );
    }

    return (
        <button type={type} onClick={onClick} disabled={disabled} className={cls}>
            {children}
        </button>
    );
}

interface EyebrowProps {
    children: ReactNode;
    className?: string;
}

export function Eyebrow({ children, className = '' }: EyebrowProps) {
    return (
        <p className={`text-xs uppercase tracking-[0.18em] text-[var(--fg-muted)] ${className}`}>
            {children}
        </p>
    );
}
