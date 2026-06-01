import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { id, action } = await req.json();

    if (!id || !action) {
      return NextResponse.json({ error: "必須パラメータが不足しています" }, { status: 400 });
    }

    if (!["approved", "rejected"].includes(action)) {
      return NextResponse.json({ error: "無効なアクションです" }, { status: 400 });
    }

    const { error } = await supabase
      .from("inquiries")
      .update({
        status: action,
        approved_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "ステータス更新中にエラーが発生しました" }, { status: 500 });
  }
}
