import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { generateAIReply } from "@/lib/claude";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, name, category, body } = await req.json();

    if (!id || !name || !category || !body) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
    }

    const aiResult = await generateAIReply(name, category, body);

    const sb = getSupabase();
    if (!sb) {
      return NextResponse.json({ success: true, result: aiResult });
    }

    const { error } = await sb
      .from("inquiries")
      .update({ ai_reply: aiResult.reply, ai_category: aiResult.category, urgency: aiResult.urgency })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true, result: aiResult });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "AI生成中にエラーが発生しました" }, { status: 500 });
  }
}
