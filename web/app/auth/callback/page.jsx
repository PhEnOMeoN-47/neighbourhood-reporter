"use client";

import { useEffect } from "react";

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      window.location.replace("/login");
      return;
    }

    // Set cookie
    document.cookie = `token=${token}; path=/; Secure; SameSite=None`;

    // ⏱ Give browser time to persist cookie
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 100);
  }, []);

  return <p>Signing you in…</p>;
}
