import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
