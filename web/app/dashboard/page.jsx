"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      try {
        // ✅ Auth check
        const meRes = await fetch("http://127.0.0.1:4000/me", {
          credentials: "include",
        });

        if (!meRes.ok) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        if (isMounted) setUser(meData);

        // ✅ Fetch reports
        const reportsRes = await fetch("http://127.0.0.1:4000/reports");
        const reportsData = await reportsRes.json();
        if (isMounted) setReports(reportsData);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <p style={{ padding: "40px" }}>Loading dashboard...</p>;
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>Dashboard</h1>

      {user && (
        <p>
          Logged in as <strong>{user.email}</strong>
        </p>
      )}

      <h2 style={{ marginTop: "30px" }}>Reported Issues</h2>

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
