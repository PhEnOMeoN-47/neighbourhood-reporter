"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Pothole");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

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
        if (isMounted) setUser(meData);

        const reportsRes = await fetch("http://127.0.0.1:4000/reports");
        const reportsData = await reportsRes.json();
        if (isMounted) setReports(reportsData);
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Submit report
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("http://127.0.0.1:4000/reports", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          category,
          latitude: latitude ? Number(latitude) : null,
          longitude: longitude ? Number(longitude) : null,
        }),
      });

      const newReport = await res.json();

      // ✅ Add new report to list immediately
      setReports((prev) => [newReport, ...prev]);

      // ✅ Reset form
      setTitle("");
      setDescription("");
      setCategory("Pothole");
      setLatitude("");
      setLongitude("");
    } catch (err) {
      console.error("Failed to submit report:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: "40px", maxWidth: "700px" }}>
      <h1>Dashboard</h1>

      <p>
        Logged in as <strong>{user.email}</strong>
      </p>

      {/* ✅ REPORT FORM */}
      <h2 style={{ marginTop: "30px" }}>Report an Issue</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "30px" }}>
        <div>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
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
        </div>

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
          type="submit"
          disabled={submitting}
          style={{
            marginTop: "10px",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      {/* ✅ REPORT LIST */}
      <h2>Reported Issues</h2>

      {reports.length === 0 ? (
        <p>No issues reported yet.</p>
      ) : (
        <ul>
          {reports.map((report) => (
            <li key={report.id} style={{ marginBottom: "8px" }}>
              <strong>{report.title}</strong> — {report.category} (
              {report.status})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
