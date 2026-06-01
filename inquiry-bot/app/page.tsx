import InquiryForm from "@/components/InquiryForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-navy-900 to-navy-700 py-8 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow mb-4">
            <svg className="w-7 h-7 text-navy-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">お問い合わせ</h1>
          <p className="text-navy-200 text-sm">株式会社サンプル工務店</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
          <InquiryForm />
        </div>

        <p className="text-center text-navy-300 text-xs mt-6">
          通常2〜3営業日以内にご返信いたします
        </p>
      </div>
    </main>
  );
}
