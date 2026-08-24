"use client";
import { useState, useRef } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [phone, setPhone] = useState("09171234567");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone"|"code">("phone");
  const [msg, setMsg] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<HTMLInputElement[]>([]);

  async function send() {
    setLoading(true); setMsg(null);
    const r = await fetch("/api/auth/otp/send", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone })});
    const j = await r.json(); setLoading(false);
    if(!r.ok) setMsg(j.error ?? JSON.stringify(j));
    else { setDevCode(j.codeForDev ?? null); setStep("code"); setMsg(j.codeForDev ? `Demo code: ${j.codeForDev} • expires in 5 min` : "Code sent — check SMS (also in server logs)"); }
  }
  async function verify() {
    setLoading(true);
    const r= await fetch("/api/auth/otp/verify",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ phone, code })});
    const j=await r.json(); setLoading(false);
    if(!r.ok) setMsg(j.error ?? JSON.stringify(j));
    else { setMsg(`✓ Verified ${j.client.phone} — provisionals claimed. Your properties & projects are now linked.`); }
  }

  function onCodeInput(v: string, idx: number){
    const chars = v.replace(/\D/g,"").slice(0,6);
    setCode(chars);
    // auto-focus next
    if(chars.length> idx && idx <5) inputsRef.current[idx+1]?.focus();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-[20px] border border-zinc-200 card p-6 md:p-8">
        <div className="h-10 w-10 rounded-xl bg-emerald-700 text-white grid place-items-center">◉</div>
        <h1 className="text-xl font-bold tracking-tight mt-3">Verify your phone</h1>
        <p className="text-sm text-zinc-600 mt-1">Phone is your identity. One client can own many properties. Enter 11-digit PH number (09…). We also auto-create account for walk-in/FB guests when they verify.</p>

        <div className="mt-6">
          {step==="phone" && (
            <div className="space-y-4">
              <label className="block">
                <div className="text-xs font-medium">PH Mobile *</div>
                <div className="mt-1 flex gap-2">
                  <span className="inline-flex items-center rounded-xl border bg-zinc-50 px-3 text-sm">🇵🇭 +63</span>
                  <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} placeholder="09171234567" className="flex-1 rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-[16px] sm:text-sm tracking-widest" />
                </div>
                <div className="text-xs text-zinc-600 mt-1">We’ll send a 6-digit code. 60s cooldown • 3 attempts.</div>
              </label>
              <button onClick={send} disabled={loading || phone.length!==11} className="w-full bg-emerald-700 text-white py-3 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed">{loading ? "Sending…" : "Send code →"}</button>
              <div className="text-xs text-center text-zinc-600">Staff? <Link href="/staff" className="underline text-emerald-700">Go to Staff Admin</Link></div>
            </div>
          )}
          {step==="code" && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-600">Code sent to <b className="text-zinc-900">{phone}</b> <button onClick={()=>setStep("phone")} className="underline ml-2">Change number</button></div>
              <div>
                <div className="text-xs font-medium">Enter 6-digit code</div>
                <div className="mt-2 flex gap-2 justify-between">
                  {Array.from({length:6}).map((_,i)=> (
                    <input
                      key={i}
                      ref={el=> { if(el) inputsRef.current[i]=el; }}
                      value={code[i] ?? ""}
                      onChange={e=> {
                        const nv = code.split("");
                        nv[i]= e.target.value.replace(/\D/g,"").slice(-1) ?? "";
                        const joined = nv.join("").slice(0,6);
                        onCodeInput(joined, i);
                      }}
                      onKeyDown={e=> { if(e.key==="Backspace" && !code[i] && i>0) inputsRef.current[i-1]?.focus(); }}
                      className="h-12 w-12 rounded-xl border border-zinc-200 bg-white text-center text-lg font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 outline-none"
                      inputMode="numeric"
                      maxLength={1}
                    />
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <button onClick={()=> setCode("")} className="text-xs underline">Clear</button>
                  <span className="text-xs text-zinc-600">Tip: paste “123456” fills all boxes.</span>
                </div>
                <input type="hidden" value={code} />
              </div>
              {devCode && <div className="text-xs bg-amber-50 border border-amber-200 p-3 rounded-xl">Demo code: <b className="font-mono text-sm">{devCode}</b> <span className="text-zinc-600">• also in dev.log</span></div>}
              <button onClick={verify} disabled={code.length!==6 || loading} className="w-full bg-emerald-700 text-white py-3 rounded-full font-semibold disabled:opacity-40 disabled:cursor-not-allowed">{loading ? "Verifying…" : "Verify & claim projects"}</button>
              <button onClick={send} className="w-full border bg-white py-2.5 rounded-full text-sm">Resend code (60s cooldown)</button>
            </div>
          )}
          {msg && <div className={`text-sm p-3 rounded-xl border whitespace-pre-wrap ${msg.startsWith("✓") ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-zinc-50 border-zinc-200"}`}>{msg}</div>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-emerald-700 text-white rounded-[20px] p-6">
          <div className="text-sm font-semibold">Why phone = identity?</div>
          <ul className="mt-3 space-y-2 text-sm text-white/90 list-disc list-inside">
            <li><b>1 client : N properties</b> — Lot 1234 Cabadbaran, Lot 5678 Butuan …</li>
            <li>Guest can request quotation without account; phone links it later.</li>
            <li>Provisionals auto-claimed on first successful OTP.</li>
            <li>Walk-in / FB Messenger: staff creates with your phone → you claim.</li>
          </ul>
          <div className="mt-4 rounded-xl bg-white text-zinc-800 p-3 text-xs border">Future: email + password optional, but phone OTP stays primary for PH clients.</div>
        </div>
        <div className="bg-white rounded-[20px] border border-zinc-200 card p-5">
          <div className="text-sm font-semibold">What you get after verify</div>
          <ul className="mt-2 text-sm text-zinc-600 space-y-1 list-disc list-inside">
            <li>My Properties with full history</li>
            <li>Track My Project — 8-step timeline + notifications</li>
            <li>Document vault (TCT/OCT, Tax Dec, Valid ID)</li>
            <li>Quotations & appointments</li>
          </ul>
          <Link href="/properties" className="mt-4 inline-flex bg-zinc-900 text-white px-4 py-2 rounded-full text-sm font-medium">Go to My Properties →</Link>
        </div>
      </div>
    </div>
  );
}
