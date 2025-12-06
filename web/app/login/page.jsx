export default function LoginPage() {
  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h1>Login to Neighbourhood Reporter</h1>

      <a href="http://127.0.0.1:4000/auth/google">
        <button style={{ padding: "10px 20px", fontSize: "18px" }}>
          Sign in with Google
        </button>
      </a>
    </div>
  );
}
