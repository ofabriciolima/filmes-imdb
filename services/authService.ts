import { getSupabaseClient } from "@/lib/supabase/client";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha inválidos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  "User already registered": "Já existe uma conta com esse e-mail.",
};

function translateAuthError(message: string): string {
  return ERROR_MESSAGES[message] ?? message;
}

export interface SignUpResult {
  needsEmailConfirmation: boolean;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string
): Promise<SignUpResult> {
  const supabase = await getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });

  if (error) throw new Error(translateAuthError(error.message));

  return { needsEmailConfirmation: !data.session };
}

export async function signIn(email: string, password: string): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(translateAuthError(error.message));
}

export async function signOut(): Promise<void> {
  const supabase = await getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw new Error(translateAuthError(error.message));
}
