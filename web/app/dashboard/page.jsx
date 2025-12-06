"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ✅ Leaflet imports
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Fix Leaflet marker icons (VERY IMPORTANT)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

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

  // ✅ Create report
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

      {/* ✅ MAP VIEW */}
      <h2>Map View</h2>

      <MapContainer
        center={[19.076, 72.8777]}
        zoom={12}
        style={{ height: "400px", width: "100%", marginBottom: "30px" }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports
          .filter((r) => r.latitude && r.longitude)
          .map((report) => (
            <Marker
              key={report.id}
              position={[report.latitude, report.longitude]}
            >
              <Popup>
                <strong>{report.title}</strong>
                <br />
                {report.category}
                <br />
                Status: {report.status}
              </Popup>
            </Marker>
          ))}
      </MapContainer>

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

        <button type="submit" disabled={submitting} style={{ marginTop: 10 }}>
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>

      <h2>Reported Issues</h2>

      {reports.length === 0 ? (
        <p>No issues reported yet.</p>
      ) : (
        <ul>
          {reports.map((report) => (
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
