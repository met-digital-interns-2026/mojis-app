// Authentication helpers using Supabase Auth.
// Falls back gracefully when Supabase is not configured.

import { supabase } from "./supabase";

export async function signUp(email, password) {
  if (!supabase) return { data: null, error: { message: "Database not connected. Add Supabase credentials to .env.local to enable accounts." } };
  return supabase.auth.signUp({ email, password });
}

export async function signIn(email, password) {
  if (!supabase) return { data: null, error: { message: "Database not connected. Add Supabase credentials to .env.local to enable accounts." } };
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!supabase) return;
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data?.session ?? null;
}

// Subscribe to auth state changes. Returns an unsubscribe function.
export function onAuthChange(callback) {
  if (!supabase) return () => {};
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
  return () => subscription.unsubscribe();
}
