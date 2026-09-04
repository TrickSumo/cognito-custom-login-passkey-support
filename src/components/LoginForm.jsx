// src/components/LoginForm.jsx
import { useState } from "react";
import { signInWithPassword } from "../lib/auth";
import { signInWithPasskey } from "../lib/passkeyAuth";

export default function LoginForm({ onSignedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("password"); // "password" | "passkey"
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const passkeySupported =
    typeof window !== "undefined" && !!window.PublicKeyCredential;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const tokens =
        mode === "passkey"
          ? await signInWithPasskey(username)
          : await signInWithPassword(username, password);

      onSignedIn(tokens);
    } catch (err) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setError(null);
    setPassword("");
    setMode((prev) => (prev === "password" ? "passkey" : "password"));
  }

  return (
    <div style={{ maxWidth: 320, margin: "0 auto" }}>
      <h2>Sign in</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username or email"
            required
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {mode === "password" && (
          <div style={{ marginBottom: 10 }}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{ width: "100%", padding: 8 }}
            />
          </div>
        )}

        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10 }}>
          {loading
            ? "Signing in..."
            : mode === "passkey"
            ? "Sign in with passkey"
            : "Sign in"}
        </button>

        {passkeySupported && (
          <button
            type="button"
            onClick={toggleMode}
            disabled={loading}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 8,
              background: "none",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            {mode === "password" ? "Use passkey instead" : "Use password instead"}
          </button>
        )}

        {error && (
          <p style={{ color: "red", marginTop: 10, fontSize: 14 }}>{error}</p>
        )}
      </form>
    </div>
  );
}