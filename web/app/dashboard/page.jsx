"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

// ✅ STATUS BADGE (reusable UI component)
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
        borderRadius: "999px",
        backgroundColor: colors[status],
        color: "white",
        fontSize: "11px",
        fontWeight: 600,
        textTransform: "uppercase",
        marginLeft: 8,
        whiteSpace: "nowrap",
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

  // filters
  const [selectedCategory, setSelectedCategory] = useState("All");

  // form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isAdmin = user?.email === "anshul2004ak@gmail.com";

  useEffect(() => {
    async function loadDashboard() {
      try {
        const meRes = await fetch("http://127.0.0.1:4000/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        setUser(meData);

        const reportsRes = await fetch("http://127.0.0.1:4000/reports");
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  // ✅ GEOLOCATION
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
      },
      () => alert("Unable to fetch your location")
    );
  }

  // ✅ CREATE REPORT
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/reports", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        }),
      });

      const newReport = await res.json();
      setReports((prev) => [newReport, ...prev]);

      setTitle("");
      setDescription("");
      setCategory("Pothole");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  // ✅ ADMIN STATUS UPDATE
  async function handleStatusChange(reportId, status) {
    const res = await fetch(
      `http://127.0.0.1:4000/reports/${reportId}/status`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      alert(err.error);
      return;
    }

    const updated = await res.json();
    setReports((prev) =>
      prev.map((r) => (r.id === updated.id ? updated : r))
    );
  }

  async function handleLogout() {
    await fetch("http://127.0.0.1:4000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  const filteredReports =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  if (loading) return <p style={{ padding: 40 }}>Loading dashboard...</p>;

  return (
    <div style={{ padding: 40, maxWidth: 900 }}>
      <h1>Dashboard</h1>

      <p>
        Logged in as <strong>{user.email}</strong>
      </p>

      <button onClick={handleLogout} style={{ marginBottom: 24 }}>
        Logout
      </button>

      {/* FILTER */}
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 24 }}
      >
        <option value="All">All Categories</option>
        <option>Pothole</option>
        <option>Garbage</option>
        <option>Streetlight</option>
        <option>Safety</option>
        <option>Noise</option>
      </select>

      <MapView reports={filteredReports} />

      {/* FORM */}
      <h2 style={{ marginTop: 32 }}>Report an Issue</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        >
          <option>Pothole</option>
          <option>Garbage</option>
          <option>Streetlight</option>
          <option>Safety</option>
          <option>Noise</option>
        </select>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{ flex: 1, padding: 10 }}
          />
          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ flex: 1, padding: 10 }}
          />
        </div>

        <button type="button" onClick={handleUseMyLocation} style={{ marginTop: 8 }}>
          Use my location
        </button>

        <br />

        <button type="submit" disabled={submitting} style={{ marginTop: 12 }}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      {/* LIST */}
      <h2>Reported Issues</h2>

      {filteredReports.map((report) => (
        <div
          key={report.id}
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            background: "#fafafa43",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong>{report.title}</strong>
            <StatusBadge status={report.status} />
          </div>

          <div style={{ marginTop: 6, color: "#86cffaff" }}>
            {report.category}
          </div>

          {isAdmin && (
            <select
              value={report.status}
              onChange={(e) =>
                handleStatusChange(report.id, e.target.value)
              }
              style={{ marginTop: 8 }}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          )}
        </div>
      ))}
    </div>
  );
}
