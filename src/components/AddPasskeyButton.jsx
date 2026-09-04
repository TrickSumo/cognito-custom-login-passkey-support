import { useState } from "react";
import { registerPasskey } from "../lib/passkeyAuth";

export default function AddPasskeyButton({ accessToken }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    setStatus(null);
    setLoading(true);
    try {
      await registerPasskey(accessToken);
      setStatus("Passkey added!");
    } catch (err) {
      setStatus(`Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={handleAdd} disabled={loading}>
        {loading ? "Registering..." : "Add a passkey"}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
}