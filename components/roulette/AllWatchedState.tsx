"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { PartyPopper } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

export function AllWatchedState({ onReset }: { onReset: () => void }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleConfirm() {
    onReset();
    setConfirmOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-panel flex max-w-md flex-col items-center gap-4 px-8 py-12 text-center"
    >
      <PartyPopper className="size-10 text-gold-soft" />
      <h2 className="text-xl font-bold text-balance">
        Parabéns! Vocês já assistiram aos 250 filmes do IMDb 🎉
      </h2>
      <p className="text-sm text-muted-foreground">
        Reiniciem o histórico para sortear entre todos os filmes novamente.
      </p>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogTrigger
          render={
            <Button className="mt-2 rounded-2xl bg-gold text-gold-foreground hover:bg-gold-soft" />
          }
        >
          Reiniciar histórico
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reiniciar histórico?</AlertDialogTitle>
            <AlertDialogDescription>
              Isso vai marcar os 250 filmes como não assistidos novamente, para
              que todos voltem a participar do sorteio.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirm}>
              Reiniciar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
