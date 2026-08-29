"use client";

import { useState } from "react";

export default function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/sign-in/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password, rememberMe: true, callbackURL: "/admin" }),
    }).catch(() => null);
    if (!response?.ok) {
      const body = await response?.json().catch(() => null);
      setError(body?.message || body?.error?.message || "เข้าสู่ระบบไม่สำเร็จ");
      setBusy(false);
      return;
    }
    window.location.href = "/admin";
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-4">
      <label className="block text-sm font-bold text-gray-700">Email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#c43c3c]" autoComplete="email" /></label>
      <label className="block text-sm font-bold text-gray-700">Password<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-[#c43c3c]" autoComplete="current-password" /></label>
      {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p>}
      <button disabled={busy} type="submit" className="w-full rounded-full bg-[#c43c3c] px-5 py-3 font-black text-white transition hover:bg-[#a83232] disabled:cursor-wait disabled:opacity-60">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
