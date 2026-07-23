"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase/client";
import {
  getCurrentSession,
  createSession as createSessionRpc,
  joinSessionByCode as joinSessionByCodeRpc,
  leaveSession as leaveSessionRpc,
  endSession as endSessionRpc,
  regenerateInviteCode as regenerateInviteCodeRpc,
} from "@/services/sessionService";
import type { SessionWithMembers } from "@/types/session";

function errorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Não foi possível conectar ao Supabase.";
}

export function useSession() {
  const [session, setSession] = useState<SessionWithMembers | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const current = await getCurrentSession();
      setSession(current);
      return current;
    } catch (error) {
      toast.error("Não foi possível carregar a sessão", {
        description: errorMessage(error),
      });
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    let channel: RealtimeChannel | null = null;

    (async () => {
      setIsLoading(true);
      await refresh();
      if (cancelled) return;
      setIsLoading(false);

      const supabase = await getSupabaseClient();
      if (cancelled) return;
      channel = supabase
        .channel("session_members_changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "session_members" },
          () => {
            refresh();
          }
        )
        .subscribe();
    })();

    return () => {
      cancelled = true;
      channel?.unsubscribe();
    };
  }, [refresh]);

  const createSession = useCallback(
    async (name?: string) => {
      try {
        await createSessionRpc(name);
        await refresh();
        toast.success("Sessão criada! Compartilhe o código com quem vai participar.");
      } catch (error) {
        toast.error("Não foi possível criar a sessão", {
          description: errorMessage(error),
        });
      }
    },
    [refresh]
  );

  /** Deixa o erro propagar para o form mostrar a mensagem inline junto do campo de código. */
  const joinSession = useCallback(
    async (code: string) => {
      await joinSessionByCodeRpc(code);
      await refresh();
      toast.success("Você entrou na sessão!");
    },
    [refresh]
  );

  const leaveSession = useCallback(async () => {
    try {
      await leaveSessionRpc();
      await refresh();
      toast.success("Você saiu da sessão.");
    } catch (error) {
      toast.error("Não foi possível sair da sessão", {
        description: errorMessage(error),
      });
    }
  }, [refresh]);

  const endSession = useCallback(async () => {
    try {
      await endSessionRpc();
      await refresh();
      toast.success("Sessão encerrada.");
    } catch (error) {
      toast.error("Não foi possível encerrar a sessão", {
        description: errorMessage(error),
      });
    }
  }, [refresh]);

  const regenerateCode = useCallback(async () => {
    try {
      await regenerateInviteCodeRpc();
      await refresh();
      toast.success("Novo código gerado.");
    } catch (error) {
      toast.error("Não foi possível gerar um novo código", {
        description: errorMessage(error),
      });
    }
  }, [refresh]);

  return {
    session,
    isLoading,
    createSession,
    joinSession,
    leaveSession,
    endSession,
    regenerateCode,
  };
}
