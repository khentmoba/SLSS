"use client";
import React from "react";

export function Button({ variant = "primary", size = "md", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"outline", size?: "sm"|"md"|"lg" }) {
  const base = "inline-flex items-center justify-center font-bold uppercase tracking-[0.06em] transition active:translate-y-px disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d3820] border";
  const sizes = { sm: "px-3.5 py-1.5 text-[11px] min-h-8", md: "px-5 py-2 text-xs min-h-10", lg: "px-7 py-3 text-xs min-h-11" };
  const variants = {
    primary: "bg-[#1d3820] text-white border-[#1d3820] hover:bg-[#16301a]",
    secondary: "bg-[#1f1c12] text-white border-[#1f1c12] hover:bg-[#17170f]",
    ghost: "border-transparent hover:bg-[#eee7d3] text-[#4a4230]",
    outline: "border-[#dcd3b8] bg-[#fcfaf1] hover:bg-white text-[#1f1c12]",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className="", ...props}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`bg-[#fcfaf1] border border-[#dcd3b8] card ${className}`} {...props} />;
}
export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }){
  return <div>
    {kicker && <div className="rule-label text-[#1d3820]">{kicker}</div>}
    <div className="font-display text-2xl font-extrabold tracking-tight text-[#17170f]">{title}</div>
    {desc && <div className="text-sm text-[#645b41] mt-1 max-w-2xl leading-relaxed">{desc}</div>}
  </div>;
}
export function Badge({ children, tone="zinc"}: { children: React.ReactNode; tone?: "zinc"|"emerald"|"amber"|"blue"|"red"|"purple"}) {
  const map: Record<string,string> = {
    zinc: "bg-[#f0ebdd] text-[#4a4230] border-[#dcd3b8]",
    emerald: "bg-[#eef3e9] text-[#1d3820] border-[#b9caae]",
    amber: "bg-[#fbf3df] text-[#714814] border-[#ebd094]",
    blue: "bg-[#e8f0f6] text-[#24425c] border-[#b9cede]",
    red: "bg-[#f9ebea] text-[#7a2a24] border-[#e6c0bb]",
    purple: "bg-[#f2edf7] text-[#4a3a5e] border-[#d4c7e3]",
  };
  return <span className={`inline-flex items-center border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.06em] ${map[tone]}`}>{children}</span>;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={`w-full border border-[#c9bfa3] bg-[#fcfaf1] px-3.5 py-2.5 text-[16px] sm:text-sm placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none transition ${props.className ?? ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select {...props} className={`w-full border border-[#c9bfa3] bg-[#fcfaf1] px-3.5 py-2.5 text-[16px] sm:text-sm focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={`w-full border border-[#c9bfa3] bg-[#fcfaf1] px-3.5 py-2.5 text-[16px] sm:text-sm placeholder:text-[#a79c7d] focus:border-[#1d3820] focus:ring-2 focus:ring-[#1d3820]/15 outline-none ${props.className ?? ""}`} />;
}
export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }){
  return <div className="text-center py-10 px-6">
    <div aria-hidden className="mx-auto h-10 w-10 border border-[#dcd3b8] bg-[#f0ebdd] grid place-items-center font-mono text-xs text-[#645b41]">—</div>
    <div className="font-semibold mt-3 text-[#17170f]">{title}</div>
    {desc && <div className="text-sm text-[#645b41] mt-1 max-w-md mx-auto leading-relaxed">{desc}</div>}
    {action && <div className="mt-4 flex justify-center">{action}</div>}
  </div>;
}
