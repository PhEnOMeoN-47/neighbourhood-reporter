"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

// ✅ STATUS BADGE
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
  const [selectedCategory, setSelectedCategory] = useState("All");

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === "anshul2004ak@gmail.com";

  useEffect(() => {
    async function load() {
      const me = await fetch("http://127.0.0.1:4000/me", {
        credentials: "include",
      });

      if (!me.ok) return router.push("/login");

      setUser(await me.json());

      const reportsData = await (
        await fetch("http://127.0.0.1:4000/reports")
      ).json();

      setReports(reportsData);
      setLoading(false);
    }

    load();
  }, []);

  function handleUseMyLocation() {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLatitude(pos.coords.latitude.toFixed(6));
      setLongitude(pos.coords.longitude.toFixed(6));
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const res = await fetch("http://127.0.0.1:4000/reports", {
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
    });

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
      `http://127.0.0.1:4000/reports/${id}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    const updated = await res.json();
    setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }

  if (loading) return <p style={{ padding: 40 }}>Loading…</p>;

  const filtered =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  return (
    <div style={{ background: "#f6f7fb", minHeight: "100vh", color: "#111827" }}>
      {/* ✅ NAVBAR */}
      <header
        style={{
          background: "white",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <h1 style={{ color: "#2563eb", fontWeight: 600 }}>
          Problem Reporting Dashboard
        </h1>

        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ textAlign: "right", fontSize: 14 }}>
            <div>{user.email.split("@")[0]}</div>
            <div style={{ color: "#111827" }}>{user.email}</div>
          </div>

          <button
            onClick={() =>
              fetch("http://127.0.0.1:4000/auth/logout", {
                method: "POST",
                credentials: "include",
              }).then(() => router.push("/login"))
            }
            style={{
              background: "#dc2626",
              color: "white",
              borderRadius: 8,
              padding: "8px 16px",
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main style={{ padding: 32, maxWidth: 1100, margin: "0 auto" }}>
        {/* MAP */}
        <div className="card">
          <MapView reports={filtered} />
        </div>

        {/* FILTER */}
        <div className="card">
          <h3>Filter by Category</h3>
          <select
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

        {/* FORM */}
        <div className="card">
          <h2>Report an Issue</h2>

          <form onSubmit={handleSubmit}>
            <input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Pothole</option>
              <option>Garbage</option>
              <option>Streetlight</option>
              <option>Safety</option>
              <option>Noise</option>
            </select>

            <div style={{ display: "flex", gap: 12 }}>
              <input
                placeholder="Latitude"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              <input
                placeholder="Longitude"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
            </div>

            <button type="button" className="gray" onClick={handleUseMyLocation}>
              Use My Location
            </button>

            <button disabled={submitting} className="primary">
              Submit Report
            </button>
          </form>
        </div>

        {/* LIST */}
        <h2 style={{ marginTop: 32 }}>Reported Issues</h2>

        {filtered.map((r) => (
          <div key={r.id} className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{r.title}</strong>
              <StatusBadge status={r.status} />
            </div>

            <p style={{ color: "#111827" }}>{r.category}</p>

            {isAdmin && (
              <select
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

      {/* ✅ STYLES */}
      <style jsx>{`
        .card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
        }
        input,
        textarea,
        select {
          width: 100%;
          padding: 10px;
          margin-bottom: 12px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          color: #111827;
        }
        input::placeholder,
        textarea::placeholder {
          color: #111827;
        }
        .primary {
          background: #2563eb;
          color: white;
          padding: 12px;
          border-radius: 8px;
          width: 100%;
        }
        .gray {
          background: #6b7280;
          color: white;
          padding: 12px;
          border-radius: 8px;
          width: 100%;
          margin-bottom: 10px;
        }
      `}</style>
    </div>
  );
}
