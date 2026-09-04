import { useState } from "react";
import { signUp, confirmSignUp } from "../lib/auth";

export default function SignUpForm({ onConfirmed }) {
  const [step, setStep] = useState("signup"); // "signup" | "confirm"
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState(null);

  async function handleSignUp(e) {
    e.preventDefault();
    setError(null);
    try {
      await signUp(username, password, email);
      setStep("confirm");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleConfirm(e) {
    e.preventDefault();
    setError(null);
    try {
      await confirmSignUp(username, code);
      onConfirmed(username);
    } catch (err) {
      setError(err.message);
    }
  }

  if (step === "confirm") {
    return (
      <form onSubmit={handleConfirm}>
        <p>Enter the code sent to {email}</p>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Confirmation code" required />
        <button type="submit">Confirm</button>
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={handleSignUp}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required />
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required />
      <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" required />
      <button type="submit">Sign up</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </form>
  );
}