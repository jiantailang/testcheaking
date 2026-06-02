import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || !url.startsWith("http")) return null;

  try {
    _client = createClient(url, key);
    return _client;
  } catch {
    return null;
  }
}

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
