"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ filter
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ report form
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

  // ✅ use my location
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
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

  // ✅ submit report
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

  // ✅ admin status update
  async function handleStatusChange(reportId, newStatus) {
    try {
      const res = await fetch(
        `http://127.0.0.1:4000/reports/${reportId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Failed to update status");
        return;
      }

      const updated = await res.json();
      setReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
    } catch (err) {
      console.error(err);
    }
  }

  // ✅ logout
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

  if (loading) {
    return <p style={{ padding: 40 }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: 40, maxWidth: 800 }}>
      <h1>Dashboard</h1>

      <p>
        Logged in as <strong>{user.email}</strong>
      </p>

      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      <h2>Filter Reports</h2>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      >
        <option value="All">All</option>
        <option>Pothole</option>
        <option>Garbage</option>
        <option>Streetlight</option>
        <option>Safety</option>
        <option>Noise</option>
      </select>

      <h2>Map View</h2>
      <MapView reports={filteredReports} />

      <h2>Report an Issue</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: 30 }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 10 }}
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
            style={{ flex: 1, padding: 8 }}
          />
          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ flex: 1, padding: 8 }}
          />
        </div>

        <button type="button" onClick={handleUseMyLocation} style={{ marginTop: 8 }}>
          Use my location
        </button>

        <br />

        <button type="submit" disabled={submitting} style={{ marginTop: 10 }}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      <h2>Reported Issues</h2>

      {filteredReports.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul>
          {filteredReports.map((report) => (
            <li key={report.id} style={{ marginBottom: 8 }}>
              <strong>{report.title}</strong> — {report.category} (
              {report.status})
              {isAdmin && (
                <select
                  value={report.status}
                  onChange={(e) =>
                    handleStatusChange(report.id, e.target.value)
                  }
                  style={{ marginLeft: 10 }}
                >
                  <option value="open">open</option>
                  <option value="in-progress">in-progress</option>
                  <option value="resolved">resolved</option>
                </select>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
