'use client';
import dynamic from 'next/dynamic';

const LiquidBackground = dynamic(() => import('./LiquidBackground'), { ssr: false });

export default function MouseDistortion() {
    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 2,
                pointerEvents: 'none',
            }}
        >
            <LiquidBackground />
        </div>
    );
}
