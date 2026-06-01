"use client";

import { useCallback, useEffect, useState } from "react";
import InboxList from "@/components/InboxList";
import DetailPanel from "@/components/DetailPanel";
import { supabase, Inquiry } from "@/lib/supabase";

type StatusFilter = "all" | "pending" | "approved" | "rejected";

export default function AdminPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");

  const fetchInquiries = useCallback(async () => {
    const query = supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter !== "all") query.eq("status", filter);

    const { data } = await query;
    if (data) setInquiries(data as Inquiry[]);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchInquiries();
    const interval = setInterval(fetchInquiries, 30000);
    return () => clearInterval(interval);
  }, [fetchInquiries]);

  const selectedInquiry = inquiries.find((i) => i.id === selectedId) ?? null;

  const handleApprove = async (id: string, action: "approved" | "rejected") => {
    await fetch("/api/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    await fetchInquiries();
  };

  const handleRegenerate = async (id: string) => {
    const inq = inquiries.find((i) => i.id === id);
    if (!inq) return;
    await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, name: inq.name, category: inq.category, body: inq.body }),
    });
    await fetchInquiries();
  };

  const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "すべて" },
    { value: "pending", label: "未対応" },
    { value: "approved", label: "承認済" },
    { value: "rejected", label: "却下" },
  ];

  const counts = {
    all: inquiries.length,
    pending: inquiries.filter((i) => i.status === "pending").length,
    approved: inquiries.filter((i) => i.status === "approved").length,
    rejected: inquiries.filter((i) => i.status === "rejected").length,
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Top bar */}
      <header className="bg-navy-800 text-white px-4 py-3 flex items-center justify-between shadow">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-navy-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="font-semibold text-sm md:text-base">問い合わせ管理</span>
        </div>
        <button
          onClick={() => { setLoading(true); fetchInquiries(); }}
          className="text-navy-300 hover:text-white transition-colors"
          title="更新"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-80 lg:w-96 flex flex-col border-r border-gray-200 bg-white overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-gray-100 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`flex-1 py-2.5 text-xs font-medium whitespace-nowrap px-2 transition-colors border-b-2 ${
                  filter === f.value
                    ? "border-navy-600 text-navy-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {f.label}
                {f.value === "pending" && counts.pending > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {counts.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            <InboxList
              inquiries={filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter)}
              selectedId={selectedId}
              onSelect={setSelectedId}
              loading={loading}
            />
          </div>
        </div>

        {/* Detail panel - hidden on mobile when no selection */}
        <div className={`flex-1 overflow-hidden ${selectedId ? "block" : "hidden md:flex"} flex flex-col`}>
          <DetailPanel
            inquiry={selectedInquiry}
            onApprove={handleApprove}
            onRegenerate={handleRegenerate}
          />
        </div>
      </div>

      {/* Mobile back button */}
      {selectedId && (
        <div className="md:hidden fixed bottom-4 left-4">
          <button
            onClick={() => setSelectedId(null)}
            className="bg-navy-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium"
          >
            ← 一覧へ戻る
          </button>
        </div>
      )}
    </div>
  );
}
