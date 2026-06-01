import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, category, body: inquiryBody } = body;

    if (!name || !email || !category || !inquiryBody) {
      return NextResponse.json({ error: "必須項目が未入力です" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("inquiries")
      .insert([{ name, company: company || null, email, category, body: inquiryBody }])
      .select()
      .single();

    if (error) throw error;

    // Trigger AI generation asynchronously
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
