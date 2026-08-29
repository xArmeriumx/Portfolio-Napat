"use client";

import { useState } from "react";

export default function SignOutButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function signOut() {
    setBusy(true);
    setError("");
    const response = await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ disableRedirect: true }),
    }).catch(() => null);
    if (!response?.ok) {
      setError("ออกจากระบบไม่สำเร็จ");
      setBusy(false);
      return;
    }
    window.location.href = "/admin/login";
  }

  return (
    <div className="mt-8">
      <button type="button" disabled={busy} onClick={signOut} className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-bold text-gray-700 hover:border-gray-900 disabled:cursor-wait disabled:opacity-50">
        {busy ? "Signing out…" : "Sign out"}
      </button>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-red-700">{error}</p>}
    </div>
  );
}
