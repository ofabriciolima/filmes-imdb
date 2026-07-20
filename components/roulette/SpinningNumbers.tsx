"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { randomInt } from "@/utils/random";

interface SpinningNumbersProps {
  targetRank: number;
  durationMs: number;
  onComplete: () => void;
}

const MIN_DELAY_MS = 40;
const MAX_DELAY_MS = 260;

export function SpinningNumbers({
  targetRank,
  durationMs,
  onComplete,
}: SpinningNumbersProps) {
  const [displayNumber, setDisplayNumber] = useState(() => randomInt(1, 250));
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;
    const start = performance.now();

    function tick() {
      if (cancelled) return;
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);

      if (progress >= 1) {
        setDisplayNumber(targetRank);
        onCompleteRef.current();
        return;
      }

      setDisplayNumber(randomInt(1, 250));
      const eased = 1 - Math.pow(1 - progress, 3);
      const delay = MIN_DELAY_MS + (MAX_DELAY_MS - MIN_DELAY_MS) * eased;
      timeoutId = setTimeout(tick, delay);
    }

    timeoutId = setTimeout(tick, MIN_DELAY_MS);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [durationMs, targetRank]);

  return (
    <div className="glass-panel flex flex-col items-center gap-4 px-10 py-14 sm:px-16 sm:py-20">
      <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Sorteando...
      </span>
      <div className="relative h-20 w-48 overflow-hidden sm:h-28 sm:w-64">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={displayNumber}
            initial={{ y: 36, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -36, opacity: 0 }}
            transition={{ duration: 0.12, ease: "easeOut" }}
            className="absolute inset-0 flex items-center justify-center font-mono text-6xl font-bold tabular-nums text-gold sm:text-8xl"
          >
            #{displayNumber}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
}
