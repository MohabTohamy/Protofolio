'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';

const MouseDistortion = dynamic(() => import('./MouseDistortion'), { ssr: false });

const DISABLED_PATHS = ['/three-lab/particle-ring'];

export default function MouseDistortionLoader() {
    const pathname = usePathname();
    if (DISABLED_PATHS.some(p => pathname.startsWith(p))) return null;
    return <MouseDistortion />;
}
