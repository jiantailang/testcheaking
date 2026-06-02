import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, category, body: inquiryBody } = body;

    if (!name || !email || !category || !inquiryBody) {
      return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
    }

    const sb = getSupabase();

    // Supabase未設定の場合はデモモードとして成功を返す
    if (!sb) {
      return NextResponse.json({ success: true, id: "demo", demo: true });
    }

    const { data, error } = await sb
      .from("inquiries")
      .insert([{ name, company: company || null, email, category, body: inquiryBody }])
      .select()
      .single();

    if (error) throw error;

    fetch(`${req.nextUrl.origin}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: data.id, name, category, body: inquiryBody }),
    }).catch(() => {});

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "サーバーエラーが発生しました" }, { status: 500 });
  }
}
