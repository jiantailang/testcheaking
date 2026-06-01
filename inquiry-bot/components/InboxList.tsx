"use client";

import { Inquiry } from "@/lib/supabase";

type Props = {
  inquiries: Inquiry[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: "未対応", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "承認済", color: "bg-green-100 text-green-800" },
  rejected: { label: "却下", color: "bg-red-100 text-red-800" },
};

const URGENCY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "緊急", color: "text-red-600 font-bold" },
  medium: { label: "通常", color: "text-yellow-600" },
  low: { label: "低", color: "text-gray-500" },
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function SkeletonRow() {
  return (
    <div className="p-4 border-b border-gray-100 animate-pulse">
      <div className="flex justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-12" />
      </div>
      <div className="h-3 bg-gray-200 rounded w-32 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-20" />
    </div>
  );
}

export default function InboxList({ inquiries, selectedId, onSelect, loading }: Props) {
  if (loading) {
    return (
      <div className="divide-y divide-gray-100">
        {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
      </div>
    );
  }

  if (inquiries.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <p>問い合わせはありません</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {inquiries.map((inq) => {
        const status = STATUS_LABELS[inq.status] ?? STATUS_LABELS.pending;
        const urgency = inq.urgency ? URGENCY_LABELS[inq.urgency] : null;
        return (
          <button
            key={inq.id}
            onClick={() => onSelect(inq.id)}
            className={`w-full text-left p-4 hover:bg-navy-50 transition-colors ${
              selectedId === inq.id ? "bg-navy-50 border-l-4 border-navy-600" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <span className="font-medium text-gray-900 text-sm truncate">{inq.name}
                {inq.company && <span className="text-gray-500 font-normal ml-1 text-xs">({inq.company})</span>}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-gray-600 bg-gray-100 px-2 py-0.5 rounded">{inq.category}</span>
              {urgency && <span className={`text-xs ${urgency.color}`}>{urgency.label}</span>}
            </div>
            <p className="text-xs text-gray-400">{formatDate(inq.created_at)}</p>
          </button>
        );
      })}
    </div>
  );
}
