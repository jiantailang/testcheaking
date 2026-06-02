import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const dynamic = "force-dynamic";

const MOCK_EMAIL = `件名：【お問い合わせご回答】株式会社サンプル工務店 担当者

株式会社△△
△△部 △△様

いつもお世話になっております。
株式会社サンプル工務店の担当者でございます。

この度はお問い合わせいただきまして、誠にありがとうございます。

ご連絡いただきました件につきまして、
以下のとおりご回答申し上げます。

━━━━━━━━━━━━━━━━━━━━━━
■ ご回答内容
━━━━━━━━━━━━━━━━━━━━━━

担当者より改めてご連絡いたします。
今しばらくお待ちくださいますようお願い申し上げます。

ご不明な点がございましたら、
お気軽にお申し付けください。

引き続きどうぞよろしくお願い申し上げます。

━━━━━━━━━━━━━━━━━━━━━━
【署名】
株式会社サンプル工務店
担当者名
TEL: 000-0000-0000
Email: info@sample-koumuten.co.jp
━━━━━━━━━━━━━━━━━━━━━━`;

function buildPrompt(
  senderInfo: string,
  receiverName: string,
  receiverCompany: string,
  inquiryCategory: string,
  inquiryBody: string,
  aiReply: string
): string {
  return `あなたは日本の大企業で働く「非常に優秀で礼儀正しいビジネスパーソン」です。
以下の【状況】と【満たすべき条件】を厳守し、相手に不快感を与えず、一目で要点が伝わる完璧な日本のビジネスメールを作成してください。

# 状況：
・送信者（自分）：${senderInfo}
・受信者（相手）：${receiverCompany} ${receiverName}様
・メールの目的：${inquiryCategory}へのご回答
・伝えたい詳細：${aiReply}
・元のお問い合わせ内容：${inquiryBody}

# 満たすべき条件（日本のビジネスマナー）：
1. 件名は「【用件】＋社名＋氏名」の形式にし、一目で内容がわかるようにすること。
2. 宛名は省略せず、会社名・部署名・役職・氏名を正確に記載すること。
3. 文頭には必ず「いつもお世話になっております。」等の適切なビジネス挨拶と名乗りを入れること。
4. 「結論（何のためのメールか）」を最初に述べ、詳細は箇条書き等を用いて視覚的に分かりやすく整理すること。
5. 適度な改行（20〜30文字程度、または文脈の区切り）を挟み、スマホやPCでスクロールしやすくすること。
6. 文末は「ご検討のほどよろしくお願い申し上げます。」等の適切な結びの言葉で締めること。
7. 最後に適切な【署名】のプレースホルダーを配置すること。
8. トーン＆マナー：プロフェッショナル、謙虚、かつ迅速な印象を与える文体。

# 出力：
メール本文のみを出力してください（説明文・コードブロック不要）。`;
}

export async function POST(req: NextRequest) {
  try {
    const { senderInfo, receiverName, receiverCompany, inquiryCategory, inquiryBody, aiReply } =
      await req.json();

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "your_anthropic_api_key_here") {
      return NextResponse.json({ success: true, email: MOCK_EMAIL });
    }

    const client = new Anthropic({ apiKey });
    const prompt = buildPrompt(senderInfo, receiverName, receiverCompany, inquiryCategory, inquiryBody, aiReply);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const email = message.content[0].type === "text" ? message.content[0].text : MOCK_EMAIL;

    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "メール生成中にエラーが発生しました" }, { status: 500 });
  }
}
