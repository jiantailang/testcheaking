import Anthropic from "@anthropic-ai/sdk";

export type AIResponse = {
  category: string;
  urgency: "high" | "medium" | "low";
  reply: string;
};

const MOCK_RESPONSE: AIResponse = {
  category: "一般的な質問",
  urgency: "low",
  reply: "お問い合わせありがとうございます。担当者より改めてご連絡いたします。",
};

const SYSTEM_PROMPT = `あなたは「株式会社サンプル工務店」の問い合わせ対応アシスタントです。
業種：工務店（住宅リフォーム・新築・外壁塗装）

【回答ルール】
* 丁寧・簡潔・誠実なトーンで書く
* 必ず①感謝またはお詫び ②具体的な次のアクション ③締めの言葉 を含める
* 価格の断言・工期の確約はしない
* 競合他社に言及しない
* 200〜300文字程度に収める

【出力形式】
以下のJSON形式で返すこと（マークダウン不要）：
{"category":"見積もり依頼 | クレーム・不具合 | 一般的な質問 | アフターサービス | その他","urgency":"high | medium | low","reply":"回答文をここに記載"}`;

export async function generateAIReply(
  name: string,
  category: string,
  body: string
): Promise<AIResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey === "your_key_here") {
    return MOCK_RESPONSE;
  }

  try {
    const client = new Anthropic({ apiKey });

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `問い合わせ者：${name}\n種別：${category}\n内容：${body}`,
        },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("JSON not found in response");

    const parsed = JSON.parse(jsonMatch[0]) as AIResponse;
    return parsed;
  } catch {
    return MOCK_RESPONSE;
  }
}
