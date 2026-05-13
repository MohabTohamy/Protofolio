'use client';

import { useEffect, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  animate as fmAnimate,
  type MotionValue,
} from 'framer-motion';

type Phase = 'counting' | 'morph' | 'welcome' | 'done';

// BlurText — word-by-word blur fade-in, in the style of reactbits.dev/text-animations/blur-text
function BlurText({
  text,
  baseDelay = 0,
  step = 0.08,
}: {
  text: string;
  baseDelay?: number;
  step?: number;
}) {
  const words = text.split(' ');
  return (
    <span>
      {words.map((w, i) => (
        <motion.span
          key={`${i}-${w}`}
          initial={{ opacity: 0, filter: 'blur(12px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{
            duration: 0.85,
            delay: baseDelay + i * step,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className="inline-block mr-[0.3em]"
        >
          {w}
        </motion.span>
      ))}
    </span>
  );
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// 5-point polyline. Endpoints (40,170) and (160,170) are fixed.
// Flat = all three middle points sit on y=170, evenly spaced.
// M = top-left peak, middle dip, top-right peak.
const FLAT = { p1: [60, 170], p2: [100, 170], p3: [140, 170] };
const M_LETTER = { p1: [40, 30], p2: [100, 130], p3: [160, 30] };

export default function IntroLoader({ onComplete }: { onComplete: () => void }) {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>('counting');

  const pathLength: MotionValue<number> = useMotionValue(0);
  const morphT: MotionValue<number> = useMotionValue(0);

  const d = useTransform(morphT, (v) => {
    const p1x = lerp(FLAT.p1[0], M_LETTER.p1[0], v);
    const p1y = lerp(FLAT.p1[1], M_LETTER.p1[1], v);
    const p2x = lerp(FLAT.p2[0], M_LETTER.p2[0], v);
    const p2y = lerp(FLAT.p2[1], M_LETTER.p2[1], v);
    const p3x = lerp(FLAT.p3[0], M_LETTER.p3[0], v);
    const p3y = lerp(FLAT.p3[1], M_LETTER.p3[1], v);
    return `M 40 170 L ${p1x.toFixed(2)} ${p1y.toFixed(2)} L ${p2x.toFixed(2)} ${p2y.toFixed(2)} L ${p3x.toFixed(2)} ${p3y.toFixed(2)} L 160 170`;
  });

  // Lock scroll while overlay is up
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  // Counter + bar growth during 'counting' phase
  useEffect(() => {
    if (phase !== 'counting') return;
    const DURATION = 2600;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      pathLength.set(eased);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setPhase('morph');
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, pathLength]);

  // Phase transitions: morph → welcome → done → complete
  useEffect(() => {
    if (phase === 'morph') {
      pathLength.set(1);
      const ctrl = fmAnimate(morphT, 1, {
        duration: 1.1,
        ease: [0.65, 0, 0.35, 1],
      });
      const tm = setTimeout(() => setPhase('welcome'), 1250);
      return () => {
        ctrl.stop();
        clearTimeout(tm);
      };
    }
    if (phase === 'welcome') {
      const tm = setTimeout(() => setPhase('done'), 3200);
      return () => clearTimeout(tm);
    }
    if (phase === 'done') {
      const tm = setTimeout(onComplete, 700);
      return () => clearTimeout(tm);
    }
  }, [phase, morphT, pathLength, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] bg-[var(--bg)] flex flex-col items-center justify-center"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 'done' ? 0 : 1 }}
      transition={{ duration: 0.65, ease: 'easeOut' }}
      style={{ pointerEvents: phase === 'done' ? 'none' : 'auto' }}
    >
      {/* Top-right status */}
      <div
        className="absolute top-8 right-8 text-[10px] uppercase tracking-[0.25em] text-[var(--fg-dim)]"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent)] mr-2 align-middle animate-pulse" />
        Initializing
      </div>

      {/* Center — morphing bar → M */}
      <div className="flex items-center justify-center w-full">
        <svg
          viewBox="0 0 200 200"
          className="w-[280px] h-[280px]"
          aria-hidden
        >
          <motion.path
            d={d as unknown as string}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ pathLength }}
          />
        </svg>
      </div>

      {/* Welcome text */}
      <div className="mt-2 px-6 text-center max-w-2xl min-h-[140px]">
        <AnimatePresence>
          {(phase === 'welcome' || phase === 'done') && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div
                className="text-4xl md:text-5xl text-[var(--fg)] leading-tight"
                style={{ fontFamily: 'var(--font-instrument-serif)' }}
              >
                <BlurText text="Welcome." baseDelay={0} />
              </div>
              <div className="mt-4 text-base md:text-lg text-[var(--fg-muted)] leading-relaxed">
                <BlurText
                  text="Press F11 for the full experience before you enter the 3D Lab."
                  baseDelay={0.45}
                  step={0.06}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom-left counter */}
      <div
        className="absolute bottom-8 left-8 flex items-baseline gap-2 text-[var(--fg)]"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        <span className="text-6xl md:text-7xl tabular-nums leading-none">
          {String(count).padStart(3, '0')}
        </span>
        <span className="text-xl text-[var(--fg-muted)]">%</span>
      </div>

      {/* Bottom-right hairline label */}
      <div
        className="absolute bottom-8 right-8 text-[10px] uppercase tracking-[0.25em] text-[var(--fg-dim)]"
        style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
      >
        Mohab Tohamy — Portfolio
      </div>
    </motion.div>
  );
}
