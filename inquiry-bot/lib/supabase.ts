import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase environment variables are not set.");
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

// Convenience export used in API routes (server-side only)
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export type Inquiry = {
  id: string;
  created_at: string;
  name: string;
  company: string | null;
  email: string;
  category: string;
  body: string;
  ai_reply: string | null;
  ai_category: string | null;
  status: "pending" | "approved" | "rejected";
  approved_at: string | null;
  urgency?: "high" | "medium" | "low";
};
