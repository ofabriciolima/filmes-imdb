import type { Profile } from "./profile";

/** Espelha a tabela `public.sessions`. */
export interface Session {
  id: string;
  name: string | null;
  owner_id: string;
  max_members: number;
  status: "active" | "ended";
  invite_code: string | null;
  invite_code_expires_at: string | null;
  created_at: string;
}

/** Espelha a tabela `public.session_members`. */
export interface SessionMember {
  session_id: string;
  user_id: string;
  role: "owner" | "member";
  joined_at: string;
}

export interface SessionMemberWithProfile extends SessionMember {
  profile: Profile | null;
}

export interface SessionWithMembers extends Session {
  members: SessionMemberWithProfile[];
}
