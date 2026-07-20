"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ConfettiBurstProps {
  onComplete?: () => void;
}

const COLORS = ["#e5b93d", "#f5c451", "#ffffff", "#f2555c", "#8b7cf6"];
const PARTICLE_COUNT = 60;
const BURST_DURATION_MS = 2600;

interface Particle {
  id: number;
  xVw: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
  width: number;
  driftPx: number;
}

function generateParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, (_, id) => ({
    id,
    xVw: Math.random() * 100,
    delay: Math.random() * 0.4,
    duration: 1.8 + Math.random() * 1.2,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: 6 + Math.random() * 8,
    driftPx: (Math.random() - 0.5) * 200,
  }));
}

/** Deve ser montado condicionalmente pelo componente pai a cada nova explosão de confete. */
export function ConfettiBurst({ onComplete }: ConfettiBurstProps) {
  const [particles] = useState<Particle[]>(generateParticles);

  useEffect(() => {
    const timeout = setTimeout(() => onComplete?.(), BURST_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          initial={{ x: `${particle.xVw}vw`, y: "-10vh", opacity: 1, rotate: 0 }}
          animate={{
            y: "110vh",
            x: `calc(${particle.xVw}vw + ${particle.driftPx}px)`,
            opacity: [1, 1, 0],
            rotate: particle.rotation,
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: "easeIn",
          }}
          style={{
            position: "absolute",
            width: particle.width,
            height: particle.width * 0.4,
            backgroundColor: particle.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
