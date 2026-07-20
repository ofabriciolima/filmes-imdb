"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DrawButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function DrawButton({
  onClick,
  label = "🎬 Sortear Filme",
  className,
}: DrawButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className={cn(
        "rounded-full bg-gradient-to-b from-gold-soft to-gold px-10 py-5 text-lg font-bold text-gold-foreground shadow-2xl shadow-gold/20 ring-1 ring-gold-soft/50 transition-shadow hover:shadow-gold/40 sm:px-14 sm:py-6 sm:text-xl",
        className
      )}
    >
      {label}
    </motion.button>
  );
}
