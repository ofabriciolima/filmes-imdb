import { getSupabaseClient } from "@/lib/supabase/client";
import type { Session, SessionWithMembers } from "@/types/session";

/** Sessão atual do usuário logado (com membros + perfis), ou null se não estiver em nenhuma. */
export async function getCurrentSession(): Promise<SessionWithMembers | null> {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: myMembership, error: membershipError } = await supabase
    .from("session_members")
    .select("session_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (membershipError) throw membershipError;
  if (!myMembership) return null;

  const { data: session, error: sessionError } = await supabase
    .from("sessions")
    .select("*")
    .eq("id", myMembership.session_id)
    .single();
  if (sessionError) throw sessionError;

  const { data: members, error: membersError } = await supabase
    .from("session_members")
    .select("session_id, user_id, role, joined_at, profile:profiles(id, display_name, created_at)")
    .eq("session_id", myMembership.session_id);
  if (membersError) throw membersError;

  return { ...session, members: members ?? [] } as unknown as SessionWithMembers;
}

export async function createSession(name?: string): Promise<Session> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc("create_session", {
    p_name: name ?? null,
  });
  if (error) throw new Error(error.message);
  return data as Session;
}

export async function joinSessionByCode(code: string): Promise<Session> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc("join_session_by_code", {
    p_code: code,
  });
  if (error) throw new Error(error.message);
  return data as Session;
}

export async function leaveSession(): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.rpc("leave_session");
  if (error) throw new Error(error.message);
}

export async function endSession(): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.rpc("end_session");
  if (error) throw new Error(error.message);
}

export async function regenerateInviteCode(): Promise<Session> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.rpc("regenerate_invite_code");
  if (error) throw new Error(error.message);
  return data as Session;
}
