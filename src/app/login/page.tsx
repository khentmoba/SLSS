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
    if(chars.length> idx && idx <5) inputsRef.current[idx+1]?.focus();
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid lg:grid-cols-2 gap-6 items-start">
      <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-6 md:p-8 relative overflow-hidden">
        <span aria-hidden className="absolute top-0 left-0 h-[2px] w-full bg-[#1d3820]" />
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 border border-[#1d3820] bg-[#1d3820] text-white grid place-items-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8"/><path d="M4 20c1.5-4 4.5-5.5 8-5.5s6.5 1.5 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-[#17170f]">Verify your phone</h1>
            <p className="text-sm text-[#645b41] mt-0.5">Phone is your identity. One client can own many properties.</p>
          </div>
        </div>
        <p className="text-sm text-[#645b41] mt-4">Enter 11-digit PH number (09…). We also auto-create account for walk-in/FB guests when they verify.</p>

        <div className="mt-6">
          {step==="phone" && (
            <div className="space-y-4">
              <label className="block">
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">PH Mobile *</div>
                <div className="mt-2 flex gap-2">
                  <span className="inline-flex items-center border border-[#c9bfa3] bg-[#f0ebdd] px-3 font-mono text-xs text-[#4a4230]">PH · +63</span>
                  <input value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} placeholder="09171234567" className="flex-1 border border-[#c9bfa3] bg-white px-3.5 py-3 text-[16px] sm:text-sm tracking-widest font-mono placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none" />
                </div>
                <div className="font-mono text-[11px] text-[#837858] mt-1.5">We’ll send a 6-digit code. 60s cooldown • 3 attempts.</div>
              </label>
              <button onClick={send} disabled={loading || phone.length!==11} className="w-full bg-[#1d3820] text-white py-3 font-bold uppercase tracking-[0.06em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16301a]">{loading ? "Sending…" : "Send code →"}</button>
              <div className="text-xs text-center text-[#645b41]">Staff? <Link href="/staff" className="underline text-[#1d3820] font-semibold">Go to Staff Admin</Link></div>
            </div>
          )}
          {step==="code" && (
            <div className="space-y-4">
              <div className="font-mono text-xs text-[#645b41]">Code sent to <b className="text-[#17170f]">{phone}</b> <button onClick={()=>setStep("phone")} className="underline ml-2 text-[#1d3820]">Change number</button></div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.06em] text-[#4a4230]">Enter 6-digit code</div>
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
                      className="h-14 w-full max-w-[54px] border border-[#c9bfa3] bg-white text-center text-lg font-mono font-semibold focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none"
                      inputMode="numeric"
                      maxLength={1}
                    />
                  ))}
                </div>
                <div className="mt-2 flex gap-3 font-mono text-[11px] text-[#645b41]">
                  <button onClick={()=> setCode("")} className="underline">Clear</button>
                  <span>Tip: paste “123456” fills all boxes.</span>
                </div>
                <input type="hidden" value={code} />
              </div>
              {devCode && <div className="font-mono text-xs bg-[#fbf3df] border border-[#ebd094] p-3">Demo code: <b className="text-sm">{devCode}</b> <span className="text-[#714814]">• also in dev.log</span></div>}
              <button onClick={verify} disabled={code.length!==6 || loading} className="w-full bg-[#1d3820] text-white py-3 font-bold uppercase tracking-[0.06em] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#16301a]">{loading ? "Verifying…" : "Verify & claim projects"}</button>
              <button onClick={send} className="w-full border border-[#dcd3b8] bg-white py-2.5 text-sm text-[#1f1c12]">Resend code (60s cooldown)</button>
            </div>
          )}
          {msg && <div className={`text-sm p-3 border whitespace-pre-wrap ${msg.startsWith("✓") ? "bg-[#eef3e9] border-[#b9caae] text-[#1d3820]" : "bg-[#f0ebdd] border-[#dcd3b8] text-[#4a4230]"}`}>{msg}</div>}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-[#16301a] text-white border border-[#0c1a0e] p-6 relative overflow-hidden">
          <span aria-hidden className="absolute inset-0 draft-grid opacity-[0.05]" />
          <div className="relative">
            <div className="rule-label !text-[10px] text-[#dbe5d4]">Why phone = identity?</div>
            <ul className="mt-3 space-y-2.5 text-sm text-white/90 marker:text-[#dd5a24] list-none">
              <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">01</span><span><b>1 client : N properties</b> — Lot 1234 Cabadbaran, Lot 5678 Butuan …</span></li>
              <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">02</span><span>Guest can request quotation without account; phone links it later.</span></li>
              <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">03</span><span>Provisionals auto-claimed on first successful OTP.</span></li>
              <li className="flex gap-2"><span className="text-[#dd5a24] font-mono">04</span><span>Walk-in / FB Messenger: staff creates with your phone → you claim.</span></li>
            </ul>
            <div className="mt-4 border border-white/20 bg-white text-[#17170f] p-3 font-mono text-xs">Future: email + password optional, but phone OTP stays primary for PH clients.</div>
          </div>
        </div>
        <div className="bg-[#fcfaf1] border border-[#dcd3b8] card p-5">
          <div className="rule-label !text-[10px] text-[#1d3820]">After verification</div>
          <ul className="mt-3 text-sm text-[#645b41] space-y-1.5 list-none">
            <li className="flex gap-2"><span className="text-[#1d3820]" aria-hidden>—</span>My Properties with full history</li>
            <li className="flex gap-2"><span className="text-[#1d3820]" aria-hidden>—</span>Track My Project — 8-step timeline + notifications</li>
            <li className="flex gap-2"><span className="text-[#1d3820]" aria-hidden>—</span>Document vault (TCT/OCT, Tax Dec, Valid ID)</li>
            <li className="flex gap-2"><span className="text-[#1d3820]" aria-hidden>—</span>Quotations &amp; appointments</li>
          </ul>
          <Link href="/properties" className="mt-4 inline-flex bg-[#1f1c12] text-white px-4 py-2 text-xs font-bold uppercase tracking-[0.06em]">Go to My Properties →</Link>
        </div>
      </div>
    </div>
  );
}
