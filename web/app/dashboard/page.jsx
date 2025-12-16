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
    <div className={`page ${theme}`}>
      <header className="header">
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
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <div className="user-info">
            <div>{user.email.split("@")[0]}</div>
            <div className="email">{user.email}</div>
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
    <input
      className="input"
      value={latitude}
      onChange={(e) => setLatitude(e.target.value)}
    />
  </div>

  <div>
    <label>Longitude</label>
    <input
      className="input"
      value={longitude}
      onChange={(e) => setLongitude(e.target.value)}
    />
  </div>
</div>

<button
  type="button"
  className="btn-location"
  onClick={handleUseMyLocation}
>
  Use My Location
</button>

<button
  disabled={submitting}
  className="btn-submit"
>
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

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8fafc;
          color: #000000; /* FIX: black text in light mode */
        }

        .dark {
          background: #020617;
          color: #f8fafc;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: white;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }

        .dark .header {
          background: #020617;
          border-bottom: 1px solid #1e293b;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          text-align: right;
          font-size: 14px;
        }

        .email {
          color: #000000; /* FIX: visible in light mode */
        }

        .dark .email {
          color: #94a3b8;
        }

        .logout {
          background: #dc2626; /* FIX: red logout button */
          color: white;
          padding: 10px 16px;
          border-radius: 10px;
          font-weight: 600;
        }

        .logout:hover {
          background: #b91c1c;
        }

        .main {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px;
        }

        .map-card {
          height: 420px;
          overflow: hidden;
        }

        .map-card :global(.leaflet-container) {
          height: 100%;
          width: 100%;
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

        .section-title {
          margin-bottom: 12px;
          font-weight: 600;
        }

        .input,
        .textarea {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          margin-bottom: 16px;
          color: #000000; /* FIX: input text black in light mode */
        }

        .dark .input,
        .dark .textarea {
          background: #020617;
          color: #f8fafc;
          border-color: #334155;
        }

        .issue-desc {
          margin: 10px 0;
          color: #000000; /* FIX: visible description text */
        }

        .dark .issue-desc {
          color: #94a3b8;
        }

        @media (max-width: 640px) {
          .coords {
            flex-direction: column;
          }

          .header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
          .coords {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.coords > div {
  flex: 1;
}

.btn-location {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  background: #4b5563;
  color: white;
  font-weight: 600;
  margin-bottom: 14px;
}

.btn-location:hover {
  background: #374151;
}

.btn-submit {
  width: 100%;
  padding: 16px;
  border-radius: 14px;
  background: #2563eb;
  color: white;
  font-size: 16px;
  font-weight: 700;
}

.btn-submit:disabled {
  opacity: 0.6;
}

        }
      `}</style>
    </div>
  );
}
