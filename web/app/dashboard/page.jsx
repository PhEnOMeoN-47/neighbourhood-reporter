"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

/* ✅ STATUS BADGE — JS ONLY */
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
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
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
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === "anshul2004ak@gmail.com";

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    async function load() {
      const me = await fetch(
        "https://neighbourhood-reporter-api.onrender.com/me",
        { credentials: "include" }
      );

      if (!me.ok) {
        router.push("/login");
        return;
      }

      setUser(await me.json());

      const reportsRes = await fetch(
        "https://neighbourhood-reporter-api.onrender.com/reports",
        { credentials: "include" }
      );

      setReports(await reportsRes.json());
      setLoading(false);
    }

    load();
  }, [router]);

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;

  const filtered =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  return (
    <div className={theme} style={{ minHeight: "100vh" }}>
      <header
        style={{
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ color: "#2563eb", fontWeight: 600 }}>
          Problem Reporting Dashboard
        </h1>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <button
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <div>
            <div>{user.email}</div>
          </div>

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

      <main style={{ padding: 32 }}>
        <MapView reports={filtered} />

        <h2>Reported Issues</h2>

        {filtered.map((r) => (
          <div key={r.id}>
            <strong>{r.title}</strong> <StatusBadge status={r.status} />
          </div>
        ))}
      </main>
    </div>
  );
}
