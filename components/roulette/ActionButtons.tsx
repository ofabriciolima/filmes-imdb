"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  onDrawAgain: () => void;
  onMarkWatched: () => void;
  onWatchNow: () => void;
  onViewDetails: () => void;
}

export function ActionButtons({
  onDrawAgain,
  onMarkWatched,
  onWatchNow,
  onViewDetails,
}: ActionButtonsProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button
          onClick={onWatchNow}
          size="lg"
          className="h-14 w-full rounded-2xl bg-gold text-base font-bold text-gold-foreground hover:bg-gold-soft"
        >
          🍿 Vamos assistir
        </Button>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={onDrawAgain}
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-2xl border-white/15 bg-white/[0.03] text-sm hover:bg-white/[0.08]"
          >
            🎲 Sortear
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={onMarkWatched}
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-2xl border-white/15 bg-white/[0.03] text-sm hover:bg-white/[0.08]"
          >
            👁 Já visto
          </Button>
        </motion.div>
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            onClick={onViewDetails}
            variant="outline"
            size="lg"
            className="h-12 w-full rounded-2xl border-white/15 bg-white/[0.03] text-sm hover:bg-white/[0.08]"
          >
            📄 Detalhes
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
