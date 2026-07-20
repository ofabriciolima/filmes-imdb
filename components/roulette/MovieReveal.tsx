"use client";

import { motion } from "framer-motion";
import { MovieCard } from "./MovieCard";
import type { Movie } from "@/types/movie";

export function MovieReveal({ movie }: { movie: Movie }) {
  return (
    <motion.div
      key={movie.rank}
      initial={{ opacity: 0, scale: 0.92, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <MovieCard movie={movie} />
    </motion.div>
  );
}
