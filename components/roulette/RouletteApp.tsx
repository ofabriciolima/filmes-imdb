"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { DrawButton } from "./DrawButton";
import { SpinWheel } from "./SpinWheel";
import { MovieReveal } from "./MovieReveal";
import { ActionButtons } from "./ActionButtons";
import { MovieDetailsDialog } from "./MovieDetailsDialog";
import { AllWatchedState } from "./AllWatchedState";
import { ConfettiBurst } from "./ConfettiBurst";
import { useWatchedMovies } from "@/hooks/useWatchedMovies";
import { useMovieDraw } from "@/hooks/useMovieDraw";
import { useAuth } from "@/hooks/useAuth";
import { useSession } from "@/hooks/useSession";
import { getAllMovies } from "@/services/moviesService";
import { pickRandom } from "@/utils/random";

const allMovies = getAllMovies();

const CELEBRATION_MESSAGES = [
  "🍿 Tenham um ótimo filme!",
  "Boa sessão! Aproveitem o filme.",
];

export function RouletteApp() {
  const { user, signOut } = useAuth();
  const {
    session,
    isLoading: isSessionLoading,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    regenerateCode,
  } = useSession();
  const {
    watchedRanks,
    isLoading: isWatchedLoading,
    markWatched,
    resetHistory,
  } = useWatchedMovies(session?.id ?? null);
  const isLoading = isSessionLoading || isWatchedLoading;
  const [includeWatched, setIncludeWatched] = useState(true);
  const {
    phase,
    isAllWatched,
    selectedMovie,
    targetRank,
    spinDurationMs,
    eligibleCount,
    totalCount,
    draw,
    completeSpin,
    resetToIdle,
  } = useMovieDraw(allMovies, watchedRanks, includeWatched);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");

  function handleMarkWatched() {
    if (!selectedMovie) return;
    markWatched(selectedMovie, "👁 Marcado como já visto");
    resetToIdle();
  }

  function handleWatchNow() {
    if (!selectedMovie) return;
    setCelebrationMessage(pickRandom(CELEBRATION_MESSAGES));
    setConfettiActive(true);
    markWatched(selectedMovie, "Salvo no Supabase ✓");
  }

  function handleViewDetails() {
    if (!selectedMovie) return;
    setDetailsOpen(true);
  }

  const handleConfettiComplete = useCallback(() => {
    setConfettiActive(false);
    resetToIdle();
  }, [resetToIdle]);

  return (
    <div className="flex w-full flex-1 flex-col">
      <Header
        includeWatched={includeWatched}
        onIncludeWatchedChange={setIncludeWatched}
        eligibleCount={eligibleCount}
        totalCount={totalCount}
        userEmail={user?.email ?? null}
        onSignOut={signOut}
        session={session}
        currentUserId={user?.id ?? null}
        onCreateSession={() => createSession()}
        onJoinSession={joinSession}
        onLeaveSession={leaveSession}
        onEndSession={endSession}
        onRegenerateCode={regenerateCode}
      />

      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-8 px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Carregando...
            </motion.div>
          ) : isAllWatched ? (
            <motion.div
              key="all-watched"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <AllWatchedState onReset={resetHistory} />
            </motion.div>
          ) : phase === "spinning" && targetRank !== null ? (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <SpinWheel
                targetRank={targetRank}
                totalCount={totalCount}
                durationMs={spinDurationMs}
                onComplete={completeSpin}
              />
            </motion.div>
          ) : phase === "revealed" && selectedMovie ? (
            <motion.div
              key="revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex w-full flex-col items-center gap-6"
            >
              <MovieReveal movie={selectedMovie} />
              <div className="w-full max-w-sm">
                <ActionButtons
                  onDrawAgain={draw}
                  onMarkWatched={handleMarkWatched}
                  onWatchNow={handleWatchNow}
                  onViewDetails={handleViewDetails}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <DrawButton onClick={draw} />
              <p className="text-sm text-muted-foreground">
                Sorteie entre {eligibleCount} filmes do Top 250 do IMDb
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <MovieDetailsDialog
        movie={selectedMovie}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {confettiActive && (
        <ConfettiBurst onComplete={handleConfettiComplete} />
      )}

      <AnimatePresence>
        {confettiActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-x-0 top-1/2 z-[70] flex -translate-y-1/2 justify-center px-4"
          >
            <span className="glass-panel px-8 py-5 text-center text-xl font-bold text-gold-soft sm:text-2xl">
              {celebrationMessage}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
