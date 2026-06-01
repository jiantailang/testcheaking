"use client";

import { useState } from "react";
import { Inquiry } from "@/lib/supabase";

type Props = {
  inquiry: Inquiry | null;
  onApprove: (id: string, action: "approved" | "rejected") => Promise<void>;
  onRegenerate: (id: string) => Promise<void>;
};

function formatDateFull(dateStr: string) {
  return new Date(dateStr).toLocaleString("ja-JP", {
    year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DetailPanel({ inquiry, onApprove, onRegenerate }: Props) {
  const [copying, setCopying] = useState(false);
  const [processing, setProcessing] = useState(false);

  if (!inquiry) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
        <svg className="w-16 h-16 mb-4 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p>問い合わせを選択してください</p>
      </div>
    );
  }

  const handleCopy = async () => {
    if (!inquiry.ai_reply) return;
    await navigator.clipboard.writeText(inquiry.ai_reply);
    setCopying(true);
    setTimeout(() => setCopying(false), 2000);
  };

  const handleAction = async (action: "approved" | "rejected") => {
    setProcessing(true);
    try {
      await onApprove(inquiry.id, action);
    } finally {
      setProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    setProcessing(true);
    try {
      await onRegenerate(inquiry.id);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-5 overflow-y-auto h-full">
      {/* Header */}
      <div className="border-b border-gray-100 pb-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="text-lg font-bold text-gray-900">{inquiry.name}
            {inquiry.company && <span className="text-gray-500 font-normal text-sm ml-2">({inquiry.company})</span>}
          </h2>
          <span className={`text-xs px-2 py-1 rounded-full ${
            inquiry.status === "approved" ? "bg-green-100 text-green-800" :
            inquiry.status === "rejected" ? "bg-red-100 text-red-800" :
            "bg-yellow-100 text-yellow-800"
          }`}>
            {inquiry.status === "approved" ? "承認済" : inquiry.status === "rejected" ? "却下" : "未対応"}
          </span>
        </div>
        <p className="text-sm text-gray-500">{inquiry.email}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDateFull(inquiry.created_at)}</p>
      </div>

      {/* Inquiry body */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{inquiry.category}</span>
          {inquiry.urgency && (
            <span className={`text-xs font-medium ${
              inquiry.urgency === "high" ? "text-red-600" :
              inquiry.urgency === "medium" ? "text-yellow-600" : "text-gray-500"
            }`}>
              {inquiry.urgency === "high" ? "🔴 緊急" : inquiry.urgency === "medium" ? "🟡 通常" : "🟢 低"}
            </span>
          )}
        </div>
        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
          {inquiry.body}
        </div>
      </div>

      {/* AI Reply */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
          <svg className="w-4 h-4 text-navy-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H3a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2h-2" />
          </svg>
          AI生成回答案
        </h3>
        {inquiry.ai_reply ? (
          <div className="bg-navy-50 border border-navy-200 rounded-lg p-4 text-sm text-gray-800 whitespace-pre-wrap">
            {inquiry.ai_reply}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-400 animate-pulse">
            AI回答を生成中...
          </div>
        )}
      </div>

      {/* Actions */}
      {inquiry.status === "pending" && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => handleAction("approved")}
            disabled={processing || !inquiry.ai_reply}
            className="flex-1 py-2.5 px-4 bg-navy-700 hover:bg-navy-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            {processing ? (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : "✓"} 承認・返信
          </button>
          <button
            onClick={handleCopy}
            disabled={!inquiry.ai_reply}
            className="py-2.5 px-4 bg-white border border-navy-300 hover:bg-navy-50 disabled:opacity-50 text-navy-700 text-sm font-medium rounded-lg transition-colors"
          >
            {copying ? "コピー済！" : "コピー"}
          </button>
          <button
            onClick={handleRegenerate}
            disabled={processing}
            className="py-2.5 px-4 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            再生成
          </button>
        </div>
      )}

      {inquiry.status !== "pending" && inquiry.approved_at && (
        <p className="text-xs text-gray-400">
          {inquiry.status === "approved" ? "承認日時" : "却下日時"}：{formatDateFull(inquiry.approved_at)}
        </p>
      )}
    </div>
  );
}
