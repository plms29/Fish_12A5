"use client";

import { useFormStatus } from "react-dom";

export function Field({
  label,
  hint,
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold">{label}</span>
      <input
        {...props}
        className={`${className} w-full rounded-[10px] border-2 border-ink bg-card px-3.5 py-2.5 text-[15px] shadow-[2px_2px_0_var(--ink)] outline-none placeholder:text-muted/70 focus:bg-mint-soft`}
      />
      {hint && <span className="mt-1.5 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function SubmitButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`sticker press bg-grass px-5 py-2.5 font-bold text-white disabled:opacity-60 ${className}`}
    >
      {pending ? "Đang xử lý…" : children}
    </button>
  );
}

export function FormMessage({ state }: { state: { error?: string; ok?: string } | undefined }) {
  if (!state?.error && !state?.ok) return null;
  return (
    <p
      role={state.error ? "alert" : "status"}
      className={`rounded-[10px] border-2 border-ink px-3.5 py-2.5 text-sm font-semibold ${
        state.error ? "bg-[#fde3df]" : "bg-mint"
      }`}
    >
      {state.error ?? state.ok}
    </p>
  );
}
