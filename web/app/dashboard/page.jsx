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
    <h3 className="section-title">Filter by Category</h3>
    <select
      className="input"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
    >
      <option value="All">Select a category</option>
      <option>Pothole</option>
      <option>Garbage</option>
      <option>Streetlight</option>
      <option>Safety</option>
      <option>Noise</option>
    </select>
  </div>

  <div className="card">
    <h2 className="section-title">Report an Issue</h2>

    <form onSubmit={handleSubmit} className="form">
      <label>Title</label>
      <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Description</label>
      <textarea
        className="textarea"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Category</label>
      <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>Pothole</option>
        <option>Garbage</option>
        <option>Streetlight</option>
        <option>Safety</option>
        <option>Noise</option>
      </select>

      <div className="coords">
        <div>
          <label>Latitude</label>
          <input className="input" value={latitude} onChange={(e) => setLatitude(e.target.value)} />
        </div>
        <div>
          <label>Longitude</label>
          <input className="input" value={longitude} onChange={(e) => setLongitude(e.target.value)} />
        </div>
      </div>

      <button type="button" className="btn-secondary" onClick={handleUseMyLocation}>
        📍 Use My Location
      </button>

      <button disabled={submitting} className="btn-primary">
        Submit Report
      </button>
    </form>
  </div>

  <h2 className="section-title">Reported Issues</h2>

  {filtered.map((r) => (
    <div key={r.id} className="issue-card">
      <div className="issue-header">
        <strong>{r.title}</strong>
        <StatusBadge status={r.status} />
      </div>

      <p className="issue-desc">{r.description}</p>

      <div className="issue-footer">
        <span className="pill">{r.category}</span>
      </div>

      {isAdmin && (
        <select
          className="input"
          value={r.status}
          onChange={(e) => handleStatusChange(r.id, e.target.value)}
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
  .main {
    max-width: 1100px;
    margin: 0 auto;
    padding: 32px;
  }

  .section-title {
    margin-bottom: 12px;
    font-weight: 600;
  }

  .card {
    background: white;
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  }

  .dark .card {
    background: #020617;
    border: 1px solid #1e293b;
  }

  .form label {
    font-size: 14px;
    margin-bottom: 6px;
    display: block;
    font-weight: 500;
  }

  .input,
  .textarea {
    width: 100%;
    padding: 12px;
    border-radius: 10px;
    border: 1px solid #d1d5db;
    margin-bottom: 16px;
  }

  .textarea {
    min-height: 120px;
  }

  .dark .input,
  .dark .textarea {
    background: #020617;
    color: #f8fafc;
    border-color: #334155;
  }

  .coords {
    display: flex;
    gap: 16px;
  }

  .btn-secondary {
    background: #4b5563;
    color: white;
    padding: 14px;
    border-radius: 10px;
    width: 100%;
    margin-bottom: 12px;
  }

  .btn-primary {
    background: #2563eb;
    color: white;
    padding: 14px;
    border-radius: 10px;
    width: 100%;
  }

  .issue-card {
    background: white;
    border-radius: 14px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
  }

  .dark .issue-card {
    background: #020617;
    border: 1px solid #1e293b;
  }

  .issue-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .issue-desc {
    margin: 10px 0;
    color: #6b7280;
  }

  .dark .issue-desc {
    color: #94a3b8;
  }

  .pill {
    background: #e0e7ff;
    color: #1d4ed8;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 500;
  }

  @media (max-width: 640px) {
    .coords {
      flex-direction: column;
    }
  }
`}</style>

    </div>
  );
}
