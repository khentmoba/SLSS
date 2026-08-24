"use client";
import React from "react";

export function Button({ variant = "primary", size = "md", className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary"|"secondary"|"ghost"|"outline", size?: "sm"|"md"|"lg" }) {
  const base = "inline-flex items-center justify-center font-semibold rounded-full transition active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800";
  const sizes = { sm: "px-3.5 py-2 text-xs min-h-9", md: "px-5 py-2.5 text-sm min-h-10", lg: "px-7 py-3 text-sm min-h-11" };
  const variants = {
    primary: "bg-emerald-800 text-white hover:bg-emerald-900 shadow-sm",
    secondary: "bg-zinc-900 text-white hover:bg-black",
    ghost: "hover:bg-zinc-100 text-zinc-700",
    outline: "border bg-white hover:bg-zinc-50 text-zinc-800 border-zinc-200",
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({ className="", ...props}: React.HTMLAttributes<HTMLDivElement>){
  return <div className={`bg-white rounded-2xl border border-zinc-200 card ${className}`} {...props} />;
}
export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }){
  return <div><div className="text-xs tracking-[0.12em] font-semibold text-emerald-800 uppercase">{kicker}</div><div className="text-xl font-bold tracking-tight text-zinc-900">{title}</div>{desc && <div className="text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">{desc}</div>}</div>;
}
export function Badge({ children, tone="zinc"}: { children: React.ReactNode; tone?: "zinc"|"emerald"|"amber"|"blue"|"red"|"purple"}) {
  const map: Record<string,string> = {
    zinc: "bg-zinc-100 text-zinc-700 border-zinc-200",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
  };
  return <span className={`inline-flex items-center border px-2.5 py-1 rounded-full text-xs font-semibold ${map[tone]}`}>{children}</span>;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>){
  return <input {...props} className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm placeholder:text-zinc-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none transition ${props.className ?? ""}`} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>){
  return <select {...props} className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none ${props.className ?? ""}`} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>){
  return <textarea {...props} className={`w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-[16px] sm:text-sm placeholder:text-zinc-500 focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100 outline-none ${props.className ?? ""}`} />;
}
export function Empty({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }){
  return <div className="text-center py-10 px-6"><div className="mx-auto h-10 w-10 rounded-xl bg-zinc-50 border grid place-items-center text-[10px] font-bold tracking-widest text-zinc-700">—</div><div className="font-semibold mt-3 text-zinc-900">{title}</div>{desc && <div className="text-sm text-zinc-600 mt-1 max-w-md mx-auto leading-relaxed">{desc}</div>}{action && <div className="mt-4 flex justify-center">{action}</div>}</div>;
}
