import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function hasSupabaseConfig() {
  return Boolean(url && (service || anon));
}

export function getSupabaseClient() {
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");

  // Prefer service-role key on server for admin queue CRUD.
  const key = service ?? anon;
  if (!key) throw new Error("Missing SUPABASE key (service role or anon)");

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
