import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI問い合わせ応答システム",
  description: "工務店向けAI問い合わせ自動応答システム",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
