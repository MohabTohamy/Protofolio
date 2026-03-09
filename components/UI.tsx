'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
}

export function Section({ children, className = '', id }: SectionProps) {
    return (
        <section id={id} className={`py-16 px-4 sm:px-6 lg:px-8 ${className}`}>
            <div className="max-w-7xl mx-auto">{children}</div>
        </section>
    );
}

interface SectionTitleProps {
    children: ReactNode;
    subtitle?: string;
}

export function SectionTitle({ children, subtitle }: SectionTitleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
        >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {children}
            </h2>
            {subtitle && (
                <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
            <div className="w-20 h-1 bg-linear-to-r from-primary to-accent mx-auto mt-4 rounded-full" />
        </motion.div>
    );
}

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = true }: CardProps) {
    return (
        <motion.div
            whileHover={hover ? { y: -5 } : undefined}
            className={`glass rounded-xl p-6 transition-all ${hover ? 'hover:shadow-lg hover:shadow-primary/20' : ''
                } ${className}`}
        >
            {children}
        </motion.div>
    );
}

interface ButtonProps {
    children: ReactNode;
    variant?: 'primary' | 'secondary' | 'outline';
    href?: string;
    onClick?: () => void;
    className?: string;
    fullWidth?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export function Button({
    children,
    variant = 'primary',
    href,
    onClick,
    className = '',
    fullWidth = false,
    type = 'button',
}: ButtonProps) {
    const baseStyles = `px-6 py-3 rounded-lg font-medium transition-all ${fullWidth ? 'w-full' : ''
        } ${className}`;

    const variants = {
        primary:
            'bg-white hover:bg-gray-100 text-black shadow-lg shadow-white/10',
        secondary:
            'bg-gray-700 hover:bg-gray-600 text-white shadow-lg shadow-gray-700/30',
        outline:
            'border-2 border-white text-white hover:bg-white hover:text-black',
    };

    const variantStyles = variants[variant];

    if (href) {
        return (
            <a
                href={href}
                className={`inline-block text-center ${baseStyles} ${variantStyles}`}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyles} ${variantStyles}`}
        >
            {children}
        </button>
    );
}
