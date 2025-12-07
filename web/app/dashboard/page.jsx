"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

function StatusBadge({ status }) {
  const colors = {
    open: "#f97316",
    "in-progress": "#3b82f6",
    resolved: "#16a34a",
  };

  return (
    <span
      style={{
        padding: "4px 10px",
        borderRadius: 999,
        backgroundColor: colors[status],
        color: "white",
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {status}
    </span>
  );
}

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    async function load() {
      const meRes = await fetch(
        "https://neighbourhood-reporter-api.onrender.com/me",
        { credentials: "include" }
      );

      if (!meRes.ok) {
        router.push("/login");
        return;
      }

      const me = await meRes.json();
      setUser(me);

      const repRes = await fetch(
        "https://neighbourhood-reporter-api.onrender.com/reports",
        { credentials: "include" }
      );

      setReports(await repRes.json());
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;

  return (
    <div className={theme} style={{ minHeight: "100vh", padding: 32 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2>Neighbourhood Dashboard</h2>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <span>{user.email}</span>

          <button
            onClick={() =>
              fetch(
                "https://neighbourhood-reporter-api.onrender.com/auth/logout",
                { method: "POST", credentials: "include" }
              ).then(() => router.push("/login"))
            }
          >
            Logout
          </button>
        </div>
      </header>

      <MapView reports={reports} />

      <h3 style={{ marginTop: 24 }}>Reports</h3>

      {reports.map((r) => (
        <div
          key={r.id}
          style={{
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          <strong>{r.title}</strong>{" "}
          <StatusBadge status={r.status} />
          <div>{r.category}</div>
        </div>
      ))}
    </div>
  );
}
