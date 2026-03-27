// Supabase client — this connects our app to the database.
//
// It needs two values from your Supabase project:
//   NEXT_PUBLIC_SUPABASE_URL  — the address of your database
//   NEXT_PUBLIC_SUPABASE_ANON_KEY — a public key that lets the browser talk to it
//
// These are stored in a file called .env.local (like a secret notepad).
// "NEXT_PUBLIC_" prefix means "it's OK to use this in the browser" —
// the anon key is safe to expose because RLS (Row Level Security)
// controls what people can actually do.

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// If the environment variables aren't set yet, we'll work in "offline mode"
// (pages will show empty states until Supabase is configured)
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Check if we have a real database connection
export const isConnected = () => supabase !== null;
