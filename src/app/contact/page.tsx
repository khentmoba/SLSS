import Link from "next/link";

export default function ContactPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[20px] border border-zinc-200 card overflow-hidden">
        <div className="bg-emerald-700 text-white p-6">
          <div className="text-[11px] tracking-widest font-semibold text-white/70">CONTACT SANCO</div>
          <h1 className="text-xl font-bold mt-1">We’re here to help — Cabadbaran • Butuan • Bayugan</h1>
          <p className="text-sm text-white/80 mt-1">For MVP, messages attach to your latest project’s history. Staff sees them inline + gets email.</p>
        </div>
        <div className="p-6 grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="rounded-2xl bg-zinc-50 border p-4">
              <div className="text-sm font-semibold">Support channels</div>
              <ul className="mt-2 text-sm space-y-2">
                <li className="flex gap-2"><span>💬</span><span><b>FB Messenger</b> — primary today. Staff copies portal notifications there manually.</span></li>
                <li className="flex gap-2"><span>✉️</span><span><b>Email</b> — automated per status (quotation, appointment, update).</span></li>
                <li className="flex gap-2"><span>📱</span><span><b>SMS</b> — time-critical: Appointment Confirmed, Document Required. Manual copy now, Semaphore API next.</span></li>
              </ul>
            </div>
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
              <div className="text-sm font-semibold text-emerald-800">What to include</div>
              <div className="text-sm text-emerald-700 mt-1">Lot location, survey type, TCT photo if available. We’ll create the project for you if you prefer walk-in/phone.</div>
            </div>
          </div>
          <div className="rounded-2xl border p-4 bg-white">
            <div className="text-sm font-semibold">Quick actions</div>
            <div className="mt-3 grid gap-2">
              <Link href="/request" className="bg-emerald-700 text-white py-3 rounded-full text-center text-sm font-semibold">Start your survey →</Link>
              <Link href="/track" className="border bg-white py-3 rounded-full text-center text-sm font-medium">Track my project</Link>
              <Link href="/login" className="border bg-white py-3 rounded-full text-center text-sm font-medium">Verify phone</Link>
            </div>
            <div className="text-xs text-zinc-500 mt-3">Or visit: Sanco Land Surveying Services — your property, our precision.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
