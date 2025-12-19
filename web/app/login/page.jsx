"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";



export default function LoginPage() {
  const router = useRouter();

  

  function handleGoogleLogin() {
    window.location.href = "https://neighbourhood-reporter-api.onrender.com/auth/google";
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.icon}>🛡️</div>
          <h1 style={styles.title}>Neighbourhood Reporter</h1>
          <p style={styles.subtitle}>
            Making our community better, one report at a time
          </p>
        </div>

        {/* BODY */}
        <div style={styles.body}>
          <h2 style={styles.welcome}>Welcome Back</h2>
          <p style={styles.description}>
            Sign in to start reporting and improving your neighbourhood
          </p>

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            className="google-btn"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              style={{ width: 20, height: 20 }}
            />
            <span>Continue with Google</span>
          </button>

          <hr style={styles.divider} />

          {/* FEATURES */}
          <ul style={styles.features}>
            <li>📍 Report potholes, garbage, and street issues</li>
            <li>📸 Upload photos and location details</li>
            <li>🤝 Help make your neighbourhood safer and cleaner</li>
          </ul>

          {/* FOOTER */}
          <p style={styles.footer}>
            By continuing, you agree to our{" "}
            <span style={styles.link}>Terms of Service</span> and{" "}
            <span style={styles.link}>Privacy Policy</span>
          </p>
        </div>
      </div>

      {/* ✅ STYLES */}
      <style jsx>{`
        .google-btn {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 2px solid #d1d5db; /* grey by default */
          background: white;
          color: #000000;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 15px;
          cursor: pointer;
          transition: 
            border-color 0.25s ease,
            transform 0.25s ease,
            box-shadow 0.25s ease;
        }

        .google-btn:hover {
          border-color: #10b981; /* green on hover */
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }
      `}</style>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #e6f4ef, #f0fdf9)",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    overflow: "hidden",
    background: "white",
    boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
  },
  header: {
    background: "linear-gradient(135deg, #059669, #16a34a)",
    color: "white",
    padding: "32px 24px",
    textAlign: "center",
  },
  icon: {
    fontSize: 36,
    marginBottom: 12,
  },
  title: {
    margin: 0,
    fontSize: 22,
    fontWeight: 600,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "white",
  },
  body: {
    padding: "28px 24px 32px",
    textAlign: "center",
  },
  welcome: {
    margin: 0,
    fontSize: 22,
    color: "black",
  },
  description: {
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
    color: "black",
  },
  divider: {
    margin: "24px 0",
    border: "none",
    borderTop: "1px solid #e5e7eb",
  },
  features: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    textAlign: "left",
    fontSize: 14,
    color: "black",
    display: "grid",
    gap: 10,
  },
  footer: {
    marginTop: 24,
    fontSize: 12,
    color: "black",
  },
  link: {
    color: "#10b981",
    cursor: "pointer",
  },
};
