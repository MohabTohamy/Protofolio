'use client';

import { useEffect, useState } from 'react';
import IntroLoader from './IntroLoader';

// Swap to localStorage to make this fire once per browser (forever).
// sessionStorage = once per tab/session, which is friendlier for testing
// and for recruiters who close + reopen the tab.
const STORAGE: Storage | null =
  typeof window !== 'undefined' ? window.sessionStorage : null;
const KEY = 'portfolio_intro_seen';

export default function IntroGate() {
  // Initial state is `true` so SSR + first client paint show the loader.
  // The effect below dismisses it instantly for returning visitors.
  const [show, setShow] = useState(true);

  useEffect(() => {
    if (STORAGE?.getItem(KEY)) setShow(false);
  }, []);

  if (!show) return null;

  return (
    <IntroLoader
      onComplete={() => {
        STORAGE?.setItem(KEY, '1');
        setShow(false);
      }}
    />
  );
}
