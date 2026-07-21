"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { randomInt } from "@/utils/random";

interface SpinWheelProps {
  durationMs: number;
  onComplete: () => void;
}

const SEGMENT_COUNT = 12;
const SEGMENT_DEGREES = 360 / SEGMENT_COUNT;
const WHEEL_SIZE = 280;
const LABEL_RADIUS = 112;
const GOLD = "#e5b93d";
const DARK = "#1a1922";

const segments = Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
  index: i,
  isGold: i % 2 === 0,
  midAngle: i * SEGMENT_DEGREES + SEGMENT_DEGREES / 2,
}));

const wheelBackground = `conic-gradient(${segments
  .map(
    (segment) =>
      `${segment.isGold ? GOLD : DARK} ${segment.index * SEGMENT_DEGREES}deg ${
        (segment.index + 1) * SEGMENT_DEGREES
      }deg`
  )
  .join(", ")})`;

export function SpinWheel({ durationMs, onComplete }: SpinWheelProps) {
  const [targetDeg] = useState(
    () => randomInt(4, 6) * 360 + randomInt(0, SEGMENT_COUNT - 1) * SEGMENT_DEGREES
  );

  return (
    <div className="glass-panel flex flex-col items-center gap-6 px-8 py-10 sm:px-12 sm:py-12">
      <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
        Sorteando...
      </span>

      <div
        className="relative"
        style={{ width: WHEEL_SIZE, height: WHEEL_SIZE }}
      >
        <div className="absolute left-1/2 -top-2 z-10 -translate-x-1/2">
          <div className="size-0 border-x-[10px] border-t-[16px] border-x-transparent border-t-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]" />
        </div>

        <motion.div
          className="size-full rounded-full ring-4 ring-gold/40 shadow-2xl shadow-black/60"
          style={{ background: wheelBackground }}
          initial={{ rotate: 0 }}
          animate={{ rotate: targetDeg }}
          transition={{ duration: durationMs / 1000, ease: [0.17, 0.67, 0.16, 0.99] }}
          onAnimationComplete={onComplete}
        >
          {segments.map((segment) => (
            <span
              key={segment.index}
              className={`absolute left-1/2 top-1/2 -ml-3.5 -mt-3.5 flex size-7 items-center justify-center text-sm font-bold ${
                segment.isGold ? "text-gold-foreground" : "text-gold-soft"
              }`}
              style={{
                transform: `rotate(${segment.midAngle}deg) translateY(-${LABEL_RADIUS}px)`,
              }}
            >
              {segment.index + 1}
            </span>
          ))}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-background text-2xl ring-4 ring-gold/50 shadow-lg">
          🎬
        </div>
      </div>
    </div>
  );
}
