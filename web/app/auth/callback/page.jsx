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

    // Store token as cookie on FRONTEND domain
    document.cookie = `token=${token}; path=/; Secure; SameSite=None`;

    // Go to dashboard
    window.location.replace("/dashboard");
  }, []);

  return <p>Signing you in…</p>;
}
