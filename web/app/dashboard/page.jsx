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

  // ✅ Filter state
  const [selectedCategory, setSelectedCategory] = useState("All");

  // ✅ Report form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

  // ✅ Auto-detect location
  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
      },
      (error) => {
        console.error("Geolocation error:", error.code, error.message);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            alert("Location permission denied");
            break;
          case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable");
            break;
          case error.TIMEOUT:
            alert("Location request timed out");
            break;
          default:
            alert("Unable to fetch your location");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  // ✅ Submit report
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

  // ✅ Logout
  async function handleLogout() {
    await fetch("http://127.0.0.1:4000/auth/logout", {
      method: "POST",
      credentials: "include",
    });
    router.push("/login");
  }

  // ✅ Filtered reports (single source of truth)
  const filteredReports =
    selectedCategory === "All"
      ? reports
      : reports.filter((r) => r.category === selectedCategory);

  if (loading) {
    return <p style={{ padding: 40 }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "800px" }}>
      <h1>Dashboard</h1>

      <p>
        Logged in as <strong>{user.email}</strong>
      </p>

      <button onClick={handleLogout} style={{ marginBottom: 20 }}>
        Logout
      </button>

      {/* ✅ FILTER */}
      <h2>Filter Reports</h2>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
      >
        <option value="All">All</option>
        <option value="Pothole">Pothole</option>
        <option value="Garbage">Garbage</option>
        <option value="Streetlight">Streetlight</option>
        <option value="Safety">Safety</option>
        <option value="Noise">Noise</option>
      </select>

      {/* ✅ MAP */}
      <h2>Map View</h2>
      <MapView reports={filteredReports} />

      {/* ✅ REPORT FORM */}
      <h2>Report an Issue</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        >
          <option>Pothole</option>
          <option>Garbage</option>
          <option>Streetlight</option>
          <option>Safety</option>
          <option>Noise</option>
        </select>

        <div style={{ display: "flex", gap: "10px" }}>
          <input
            type="number"
            placeholder="Latitude"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
          <input
            type="number"
            placeholder="Longitude"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            style={{ flex: 1, padding: "8px" }}
          />
        </div>

        <button
          type="button"
          onClick={handleUseMyLocation}
          style={{ marginTop: 8 }}
        >
          Use my location
        </button>

        <br />

        <button type="submit" disabled={submitting} style={{ marginTop: 10 }}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      {/* ✅ LIST */}
      <h2>Reported Issues</h2>

      {filteredReports.length === 0 ? (
        <p>No issues found.</p>
      ) : (
        <ul>
          {filteredReports.map((report) => (
            <li key={report.id}>
              <strong>{report.title}</strong> — {report.category} (
              {report.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
