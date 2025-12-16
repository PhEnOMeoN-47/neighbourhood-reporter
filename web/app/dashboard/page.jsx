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

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved) setTheme(saved);
  }, []);

  // Load user + reports
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

  function handleUseMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch(
      "https://neighbourhood-reporter-api.onrender.com/reports",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude: Number(latitude),
          longitude: Number(longitude),
        }),
      }
    );

    const newReport = await res.json();
    setReports((prev) => [newReport, ...prev]);

    setSubmitting(false);
    setTitle("");
    setDescription("");
    setLatitude("");
    setLongitude("");
  }

  async function handleStatusChange(id, status) {
    const res = await fetch(
      `https://neighbourhood-reporter-api.onrender.com/reports/${id}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    const updated = await res.json();
    setReports((prev) =>
      prev.map((r) => (r.id === id ? updated : r))
    );
  }

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;

  const filtered =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  return (
    <div className={theme}>
      <header>
        <h1>Problem Reporting Dashboard</h1>

        <div className="header-actions">
          <button
            className="theme-toggle"
            onClick={() => {
              const next = theme === "light" ? "dark" : "light";
              setTheme(next);
              localStorage.setItem("theme", next);
            }}
          >
            <span className="icon">
              {theme === "light" ? "🌙" : "☀️"}
            </span>
          </button>

          <div style={{ textAlign: "right", fontSize: 14 }}>
            <div>{user.email.split("@")[0]}</div>
            <div>{user.email}</div>
          </div>

          <button
            className="logout"
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

      <main className="main">
        <div className="card map-card">
          <MapView reports={filtered} />
        </div>

        <div className="card">
          <h3>Filter by Category</h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All</option>
            <option>Pothole</option>
            <option>Garbage</option>
            <option>Streetlight</option>
            <option>Safety</option>
            <option>Noise</option>
          </select>
        </div>

        <div className="card">
          <h2>Report an Issue</h2>
          <form onSubmit={handleSubmit}>
            <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>Pothole</option>
              <option>Garbage</option>
              <option>Streetlight</option>
              <option>Safety</option>
              <option>Noise</option>
            </select>

            <div className="coords">
              <input placeholder="Latitude" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
              <input placeholder="Longitude" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
            </div>

            <button type="button" className="gray" onClick={handleUseMyLocation}>
              Use My Location
            </button>

            <button disabled={submitting} className="primary">
              Submit Report
            </button>
          </form>
        </div>

        <h2 style={{ marginTop: 32 }}>Reported Issues</h2>

        {filtered.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{r.title}</strong>
              <StatusBadge status={r.status} />
            </div>
            <p>{r.category}</p>

            {isAdmin && (
              <select
                value={r.status}
                onChange={(e) =>
                  handleStatusChange(r.id, e.target.value)
                }
              >
                <option value="open">Open</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            )}
          </div>
        ))}
      </main>

      {/* STYLES */}
      <style jsx>{`
        .light {
          background: #f6f7fb;
          color: #111827;
          min-height: 100vh;
        }

        .dark {
          background: #020617;
          color: #f8fafc;
          min-height: 100vh;
        }

        header {
          padding: 16px 32px;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #e5e7eb;
        }

        .dark header {
          border-color: #1e293b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .main {
          padding: 32px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .dark .card {
          background: #020617;
          border: 1px solid #1e293b;
        }

        .coords {
          display: flex;
          gap: 12px;
        }

        .theme-toggle {
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: 1px solid #d1d5db;
          background: transparent;
          cursor: pointer;
        }

        .logout {
          background: #dc2626;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}
